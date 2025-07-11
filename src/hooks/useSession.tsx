import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'user_profiles'>;

interface SessionContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to prevent race conditions during concurrent updates
  const isFetchingProfile = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);

  // Fetch user profile with deduplication and error handling
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    // Prevent duplicate fetches for the same user
    if (isFetchingProfile.current && lastFetchedUserId.current === userId) {
      console.log('[Session] Skipping duplicate profile fetch for user:', userId);
      return profile;
    }

    isFetchingProfile.current = true;
    lastFetchedUserId.current = userId;

    try {
      console.log('[Session] Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging - 10 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        if (error.message?.includes('aborted')) {
          console.error('[Session] Profile fetch timed out');
          return null;
        }
        console.error('[Session] Error fetching user profile:', error);
        // Don't throw - return null to handle gracefully
        return null;
      }

      console.log('[Session] Profile fetched successfully:', {
        userId: data.id,
        role: data.role,
        email: data.email
      });

      return data;
    } catch (error) {
      console.error('[Session] Unexpected error fetching profile:', error);
      return null;
    } finally {
      isFetchingProfile.current = false;
    }
  }, [profile]);

  // Update session state with proper synchronization
  const updateSessionState = useCallback(async (
    newSession: Session | null,
    newUser: User | null,
    event?: AuthChangeEvent
  ) => {
    console.log('[Session] Updating session state:', {
      event,
      hasSession: !!newSession,
      hasUser: !!newUser,
      userId: newUser?.id
    });

    // Clear state if no session
    if (!newSession || !newUser) {
      setSession(null);
      setUser(null);
      setProfile(null);
      lastFetchedUserId.current = null;
      return;
    }

    // Update session and user immediately
    setSession(newSession);
    setUser(newUser);

    // Fetch and update profile
    const userProfile = await fetchUserProfile(newUser.id);
    
    if (userProfile) {
      setProfile(userProfile);
      console.log('[Session] Session state updated successfully:', {
        userId: newUser.id,
        role: userProfile.role,
        email: userProfile.email
      });
    } else {
      console.warn('[Session] Could not fetch user profile, clearing session');
      // If we can't get the profile, treat as signed out
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }, [fetchUserProfile]);

  // Initial session check on mount
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      try {
        console.log('[Session] Initializing session...');
        
        // Get current session from Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Session] Error getting initial session:', error);
          return;
        }

        if (mounted) {
          await updateSessionState(
            currentSession,
            currentSession?.user ?? null,
            'INITIAL_SESSION'
          );
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[Session] Error during initialization:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
    };
  }, [updateSessionState]);

  // Subscribe to auth state changes
  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('[Session] Auth state change:', {
          event,
          hasSession: !!newSession,
          userId: newSession?.user?.id,
          expiresAt: newSession?.expires_at
        });

        // Handle all session-related events
        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            // For any of these events, we need to refresh our local state
            await updateSessionState(newSession, newSession?.user ?? null, event);
            break;
            
          case 'SIGNED_OUT':
            // Clear all state immediately
            setSession(null);
            setUser(null);
            setProfile(null);
            lastFetchedUserId.current = null;
            break;
            
          default:
            console.log('[Session] Unhandled auth event:', event);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateSessionState]);

  // Manual session refresh (useful for debugging or forced refresh)
  const refreshSession = useCallback(async () => {
    try {
      console.log('[Session] Manual session refresh requested');
      
      const { data: { session: refreshedSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Session] Error refreshing session:', error);
        return;
      }

      await updateSessionState(
        refreshedSession,
        refreshedSession?.user ?? null,
        'MANUAL_REFRESH'
      );
    } catch (error) {
      console.error('[Session] Error during manual refresh:', error);
    }
  }, [updateSessionState]);

  // Sign out with proper cleanup
  const signOut = useCallback(async () => {
    try {
      console.log('[Session] Signing out...');
      
      // Clear local state first
      setSession(null);
      setUser(null);
      setProfile(null);
      lastFetchedUserId.current = null;
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Session] Error signing out:', error);
        // Even if signout fails, keep local state cleared
      }
    } catch (error) {
      console.error('[Session] Unexpected error during signout:', error);
    }
  }, []);

  const value: SessionContextType = {
    user,
    session,
    profile,
    isLoading,
    isInitialized,
    refreshSession,
    signOut
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}