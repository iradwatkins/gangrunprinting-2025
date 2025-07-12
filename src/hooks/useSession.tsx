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

  // Fetch user profile using RPC function
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profileData, error } = await supabase
        .rpc('get_or_create_profile');
      
      if (error) {
        console.error('[Session] Profile fetch error:', error);
        return null;
      }
      
      return profileData as UserProfile;
    } catch (error) {
      console.error('[Session] Unexpected error fetching profile:', error);
      return null;
    }
  }, []);

  // Initialize session on mount
  const initializeSession = useCallback(async () => {
    if (initializationRef.current) {
      return;
    }
    
    initializationRef.current = true;
    
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Session] Error getting session:', error);
        return;
      }
      
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        
        const fetchedProfile = await fetchUserProfile(currentSession.user.id);
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      }
    } catch (error) {
      console.error('[Session] Initialization error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [fetchUserProfile]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (
    event: AuthChangeEvent,
    newSession: Session | null
  ) => {
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
      const fetchedProfile = await fetchUserProfile(newSession.user.id);
      if (fetchedProfile) {
        setProfile(fetchedProfile);
      }
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