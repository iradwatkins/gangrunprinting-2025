import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback');
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthCallback: Error getting session:', error);
          navigate('/');
          return;
        }

        if (data.session) {
          console.log('AuthCallback: Session found, user:', data.session.user.email);
          
          // Wait a moment for the auth context to update
          setTimeout(() => {
            // Redirect based on user role
            if (data.session.user.email === 'iradwatkins@gmail.com') {
              navigate('/admin');
            } else {
              navigate('/');
            }
          }, 100);
        } else {
          console.log('AuthCallback: No session found, redirecting to home');
          navigate('/');
        }
      } catch (error) {
        console.error('AuthCallback: Exception:', error);
        navigate('/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}