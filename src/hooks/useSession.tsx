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

  // Fetch user profile using direct database queries
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      // Check if super admin by email
      const isSuperAdmin = user.email === 'iradwatkins@gmail.com';
      
      // Try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingProfile) {
        return {
          ...existingProfile,
          role: isSuperAdmin ? 'super_admin' : (existingProfile.role || 'customer')
        } as UserProfile;
      }

      // Create profile if it doesn't exist
      if (fetchError?.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            email: user.email,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            role: isSuperAdmin ? 'super_admin' : 'customer'
          })
          .select()
          .single();

        if (!createError && newProfile) {
          return newProfile as UserProfile;
        }
      }

      // Fallback: create basic profile object
      return {
        user_id: userId,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        role: isSuperAdmin ? 'super_admin' : 'customer'
      } as UserProfile;
      
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