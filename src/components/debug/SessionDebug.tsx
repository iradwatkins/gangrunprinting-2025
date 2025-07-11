import React from 'react';
import { useSession } from '@/hooks/useSession';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SessionDebug() {
  const sessionHook = useSession();
  const authContext = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <Card className="bg-black/90 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Session Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>SessionProvider:</strong>
            <pre className="mt-1">{JSON.stringify({
              user: sessionHook.user?.id,
              session: !!sessionHook.session,
              profile: sessionHook.profile?.email,
              isLoading: sessionHook.isLoading,
              isInitialized: sessionHook.isInitialized
            }, null, 2)}</pre>
          </div>
          <div>
            <strong>AuthContext:</strong>
            <pre className="mt-1">{JSON.stringify({
              user: authContext.user?.id,
              session: !!authContext.session,
              isAuthenticated: authContext.isAuthenticated,
              loading: authContext.loading,
              error: authContext.error
            }, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}