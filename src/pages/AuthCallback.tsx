import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback');
        console.log('Current URL:', window.location.href);
        
        // Check for authorization code in URL (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log('AuthCallback: Found authorization code, exchanging for session');
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('AuthCallback: Error exchanging code for session:', error);
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
          } else {
            console.log('AuthCallback: No session returned from code exchange');
            setError('Failed to establish session');
            setTimeout(() => navigate('/'), 2000);
          }
        } else {
          // Check for direct session (fallback for other flows)
          console.log('AuthCallback: No code found, checking for existing session');
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('AuthCallback: Error getting session:', error);
            setError(error.message);
            setTimeout(() => navigate('/'), 2000);
            return;
          }

          if (data.session) {
            console.log('AuthCallback: Existing session found:', data.session.user.email);
            
            // Redirect based on user role
            if (data.session.user.email === 'iradwatkins@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          } else {
            console.log('AuthCallback: No session found, redirecting to home');
            navigate('/');
          }
        }
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
          </div>
        )}
      </div>
    </div>
  );
}