import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, LogOut, UserX } from 'lucide-react';

export function QuickAuthFix() {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearSession = () => {
    // Clear all auth-related localStorage
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleSkipAuth = () => {
    // Set a flag to skip auth loading
    localStorage.setItem('skipAuth', 'true');
    window.location.reload();
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          Authentication Issue Detected
        </CardTitle>
        <CardDescription>
          The authentication system is having trouble loading your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This is usually caused by database permission issues. Try these options:
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out & Retry
          </Button>
          
          <Button 
            onClick={handleClearSession} 
            variant="outline" 
            className="w-full"
          >
            <UserX className="h-4 w-4 mr-2" />
            Clear Session & Reload
          </Button>
          
          <Button 
            onClick={handleSkipAuth} 
            className="w-full"
          >
            Continue Without Auth
          </Button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Auth is trying to load profile for user: 70782a82-6051-40f7-9644-32ab58e3ddf9</p>
          <p>• This is likely blocked by RLS policies on user_profiles table</p>
        </div>
      </CardContent>
    </Card>
  );
}