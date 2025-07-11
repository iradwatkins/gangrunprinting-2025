import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, LogOut, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const [hasAuthError, setHasAuthError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth errors
    const checkAuthErrors = () => {
      const authError = sessionStorage.getItem('auth_error');
      if (authError) {
        setHasAuthError(true);
        setErrorDetails(authError);
      }
    };

    checkAuthErrors();
    
    // Check periodically for auth errors
    const interval = setInterval(checkAuthErrors, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    setIsRetrying(true);
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setIsRetrying(false);
  };

  const handleClearSession = () => {
    // Clear all auth-related storage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-localhost-auth-token');
    localStorage.removeItem('sb-cfccfkkpmrrvmmtxdoay-auth-token');
    sessionStorage.removeItem('auth_error');
    
    // Force reload
    window.location.reload();
  };

  const handleContinueWithoutAuth = () => {
    localStorage.setItem('skipAuth', 'true');
    sessionStorage.removeItem('auth_error');
    setHasAuthError(false);
    window.location.reload();
  };

  const handleRetry = () => {
    sessionStorage.removeItem('auth_error');
    setHasAuthError(false);
    window.location.reload();
  };

  if (hasAuthError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <CardTitle>Authentication Issue Detected</CardTitle>
            </div>
            <CardDescription>
              The authentication system is having trouble loading your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>This is usually caused by database permission issues. Try these options:</p>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={handleSignOut}
                disabled={isRetrying}
                className="w-full"
                variant="default"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out & Retry
              </Button>
              
              <Button
                onClick={handleClearSession}
                disabled={isRetrying}
                className="w-full"
                variant="secondary"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Session & Reload
              </Button>
              
              <Button
                onClick={handleContinueWithoutAuth}
                disabled={isRetrying}
                className="w-full"
                variant="outline"
              >
                <UserX className="mr-2 h-4 w-4" />
                Continue Without Auth
              </Button>
            </div>
            
            {errorDetails && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {errorDetails}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}