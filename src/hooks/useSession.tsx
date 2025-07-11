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
  const initializationRef = useRef(false);
  
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
      
      // Special handling for admin email to avoid timeouts
      // First, let's check if we already know this is the admin email from the session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user?.email === 'iradwatkins@gmail.com') {
        console.log('[Session] Admin email detected, using simplified profile');
        const adminProfile = {
          id: `profile-${userId}`,
          user_id: userId,
          email: 'iradwatkins@gmail.com',
          full_name: 'Admin User',
          role: 'admin',
          is_broker: false,
          broker_category_discounts: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserProfile;
        
        // Let's ensure this is set immediately
        isFetchingProfile.current = false;
        return adminProfile;
      }
      
      // First try the RPC function which bypasses RLS
      try {
        const { data: rpcProfile, error: rpcError } = await supabase
          .rpc('get_or_create_profile');
        
        if (!rpcError && rpcProfile) {
          console.log('[Session] Profile fetched via RPC:', {
            userId: rpcProfile.id,
            role: rpcProfile.role,
            email: rpcProfile.email
          });
          return rpcProfile;
        }
      } catch (rpcErr) {
        console.log('[Session] RPC method not available, falling back to direct query');
      }
      
      // Fallback to direct query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);

      if (error) {
        if (error.message?.includes('aborted')) {
          console.error('[Session] Profile fetch timed out');
          return null;
        }
        console.error('[Session] Error fetching user profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('[Session] Profile not found, attempting to create...');
          const userEmail = (await supabase.auth.getUser()).data.user?.email || '';
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              email: userEmail,
              role: userEmail === 'iradwatkins@gmail.com' ? 'admin' : 'customer',
              is_broker: false,
              broker_category_discounts: {}
            })
            .select()
            .single();
          
          if (!createError && newProfile) {
            console.log('[Session] Profile created successfully');
            return newProfile;
          }
        }
        
        return null;
      }

      console.log('[Session] Profile fetched successfully:', {
        profileId: data.id,
        userId: data.user_id,
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
      console.warn('[Session] Could not fetch user profile, but keeping session active');
      // Keep the session but set profile to null
      // This allows the special handling for admin email to still work
      setProfile(null);
    }
  }, [fetchUserProfile]);

  // Initial session check on mount
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      // Prevent multiple initializations using ref
      if (initializationRef.current) {
        console.log('[Session] Already initializing or initialized, skipping...');
        return;
      }
      
      initializationRef.current = true;

      try {
        console.log('[Session] Initializing session...');
        
        // Get current session from Supabase
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Session] Error getting initial session:', error);
          if (mounted) {
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        if (mounted && currentSession) {
          setIsLoading(true);
          await updateSessionState(
            currentSession,
            currentSession.user,
            'INITIAL_SESSION'
          );
        }
      } catch (error) {
        console.error('[Session] Error during initialization:', error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
    };
  }, []); // Remove updateSessionState from dependencies to prevent loops

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

        // CRITICAL: Set loading true when handling auth changes
        setIsLoading(true);

        try {
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
              
            case 'INITIAL_SESSION':
              // Skip - this is handled by the initialization effect
              console.log('[Session] Skipping INITIAL_SESSION in auth state change handler');
              break;
              
            default:
              console.log('[Session] Unhandled auth event:', event);
          }
        } catch (error) {
          console.error('[Session] Error handling auth state change:', error);
          // On error, clear session to be safe
          setSession(null);
          setUser(null);
          setProfile(null);
        } finally {
          // CRITICAL: Always set loading to false, no matter what happens
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
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