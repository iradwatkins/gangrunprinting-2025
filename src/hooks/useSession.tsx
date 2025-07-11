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
      
      // Use the RPC function to get or create profile
      const { data: rpcProfile, error: rpcError } = await supabase
        .rpc('get_or_create_profile');
      
      if (rpcError) {
        console.error('[Session] RPC error:', rpcError);
        // If RPC fails, try direct query as fallback
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('[Session] Direct query error:', error);
          return null;
        }
        
        return data;
      }
      
      if (rpcProfile) {
        console.log('[Session] Profile fetched via RPC:', {
          userId: rpcProfile.user_id,
          role: rpcProfile.role,
          email: rpcProfile.email
        });
        return rpcProfile as UserProfile;
      }
      
      console.error('[Session] No profile data returned');
      return null;
    } catch (error) {
      console.error('[Session] Error fetching profile:', error);
      return null;
    } finally {
      isFetchingProfile.current = false;
    }
  }, [profile]);

  // Initialize session on mount
  const initializeSession = useCallback(async () => {
    if (initializationRef.current) {
      console.log('[Session] Already initializing, skipping...');
      return;
    }
    
    initializationRef.current = true;
    console.log('[Session] Initializing session...');
    
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Session] Error getting session:', error);
        return;
      }
      
      if (currentSession?.user) {
        console.log('[Session] Found active session for user:', currentSession.user.id);
        setSession(currentSession);
        setUser(currentSession.user);
        
        // Fetch user profile
        const fetchedProfile = await fetchUserProfile(currentSession.user.id);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      } else {
        console.log('[Session] No active session found');
      }
    } catch (error) {
      console.error('[Session] Initialization error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('[Session] Initialization complete');
    }
  }, [fetchUserProfile]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (
    event: AuthChangeEvent,
    newSession: Session | null
  ) => {
    console.log('[Session] Auth state change:', {
      event,
      hasSession: !!newSession,
      userId: newSession?.user?.id
    });

    // Update session state immediately
    setSession(newSession);
    setUser(newSession?.user || null);

    if (event === 'SIGNED_IN' && newSession?.user) {
      setIsLoading(true);
      const fetchedProfile = await fetchUserProfile(newSession.user.id);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
      setIsLoading(false);
    } else if (event === 'SIGNED_OUT') {
      setProfile(null);
      setUser(null);
      setSession(null);
    } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
      // Optionally refresh profile on token refresh
      const fetchedProfile = await fetchUserProfile(newSession.user.id);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
    }

    // Always update session state based on event
    if (newSession?.user) {
      console.log('[Session] Updating session state:', {
        event,
        hasSession: true,
        hasUser: true,
        userId: newSession.user.id
      });
    } else {
      console.log('[Session] Clearing session state');
    }
  }, [fetchUserProfile]);

  // Setup auth listener
  useEffect(() => {
    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeSession, handleAuthStateChange]);

  // Refresh session manually
  const refreshSession = useCallback(async () => {
    console.log('[Session] Manual refresh requested');
    setIsLoading(true);
    
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[Session] Refresh error:', error);
        return;
      }
      
      if (refreshedSession?.user) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        const fetchedProfile = await fetchUserProfile(refreshedSession.user.id);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      }
    } catch (error) {
      console.error('[Session] Refresh exception:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    console.log('[Session] Sign out requested');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Session] Sign out error:', error);
      }
    } catch (error) {
      console.error('[Session] Sign out exception:', error);
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
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}