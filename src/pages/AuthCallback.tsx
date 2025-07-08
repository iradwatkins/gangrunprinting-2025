import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback');
        console.log('Current URL:', window.location.href);
        
        // Let Supabase automatically handle the OAuth callback with detectSessionInUrl
        // We just need to wait for the session to be established and then redirect
        
        let attemptCount = 0;
        const maxAttempts = 30; // 15 seconds max wait time
        
        const pollForSession = async (): Promise<void> => {
          attemptCount++;
          setAttempts(attemptCount);
          console.log(`AuthCallback: Checking for session (attempt ${attemptCount}/${maxAttempts})`);
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('AuthCallback: Error getting session:', error);
            setError(error.message);
            setTimeout(() => navigate('/'), 2000);
            return;
          }

          if (data.session) {
            console.log('AuthCallback: Session established for:', data.session.user.email);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect based on user role
            if (data.session.user.email === 'iradwatkins@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/');
            }
            return;
          }

          // If no session yet and we haven't reached max attempts, try again
          if (attemptCount < maxAttempts) {
            setTimeout(pollForSession, 500); // Wait 500ms before next attempt
          } else {
            console.log('AuthCallback: Timeout waiting for session, redirecting to home');
            setError('Authentication timeout. Please try again.');
            setTimeout(() => navigate('/'), 2000);
          }
        };

        // Start polling for session
        await pollForSession();
        
      } catch (error) {
        console.error('AuthCallback: Exception:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-500 text-lg font-semibold mb-2">Authentication Error</div>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-sm text-gray-600">Redirecting to home page...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing sign in...</p>
            {attempts > 5 && (
              <p className="text-sm text-gray-500 mt-2">
                Establishing session... ({attempts}/30)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}