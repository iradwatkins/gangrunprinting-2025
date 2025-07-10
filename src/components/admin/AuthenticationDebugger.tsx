import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Trash2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  hasUser: boolean;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  hasSession: boolean;
  sessionExpiry?: string;
  isAdminMode: boolean;
  canUseAdminMode: boolean;
}

interface StorageData {
  localStorage: Record<string, any>;
  sessionStorage: Record<string, any>;
}

export function AuthenticationDebugger() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [storageData, setStorageData] = useState<StorageData>({ localStorage: {}, sessionStorage: {} });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isAdminMode, canUseAdminMode } = useAdminMode();
  const { toast } = useToast();

  const collectAuthState = async () => {
    try {
      const { data: { user: supabaseUser, session } } = await supabase.auth.getUser();
      
      setAuthState({
        hasUser: !!supabaseUser,
        userId: supabaseUser?.id,
        userEmail: supabaseUser?.email,
        userRole: user?.profile?.role,
        hasSession: !!session,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : undefined,
        isAdminMode,
        canUseAdminMode
      });
    } catch (error) {
      console.error('Error collecting auth state:', error);
    }
  };

  const collectStorageData = () => {
    const storage: StorageData = { localStorage: {}, sessionStorage: {} };
    
    // Collect localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          storage.localStorage[key] = value;
        } catch (error) {
          storage.localStorage[key] = '[Error reading value]';
        }
      }
    }
    
    // Collect sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          storage.sessionStorage[key] = value;
        } catch (error) {
          storage.sessionStorage[key] = '[Error reading value]';
        }
      }
    }
    
    setStorageData(storage);
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      await collectAuthState();
      collectStorageData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearAllBrowserData = async () => {
    if (!confirm('This will clear ALL browser data (localStorage, sessionStorage, cookies) and sign you out. Continue?')) {
      return;
    }

    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies (what we can access)
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      });
      
      toast({ 
        title: 'Browser Data Cleared', 
        description: 'All authentication data cleared. Page will reload...',
        duration: 2000
      });
      
      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing browser data:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to clear all data. Try manual browser clear.',
        variant: 'destructive'
      });
    }
  };

  const clearSupabaseSession = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: 'Success', description: 'Supabase session cleared' });
      await refreshAll();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to clear session', variant: 'destructive' });
    }
  };

  const clearAuthStorage = () => {
    // Clear Supabase-related items
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth') || key.includes('admin')
    );
    
    supabaseKeys.forEach(key => localStorage.removeItem(key));
    
    toast({ title: 'Success', description: `Cleared ${supabaseKeys.length} auth-related items` });
    collectStorageData();
  };

  useEffect(() => {
    refreshAll();
  }, [isAuthenticated, isAdminMode]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Authentication Debugger</h2>
          <p className="text-gray-600">Debug authentication state and clear browser cache conflicts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshAll} disabled={isRefreshing} variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={clearAllBrowserData} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Quick Fix Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Common Fix:</strong> If categories aren't loading, try "Clear All Data" button above. 
          This fixes authentication conflicts between deployments.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication State */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Authentication State
              {authState?.hasUser ? (
                <Badge variant="default">Authenticated</Badge>
              ) : (
                <Badge variant="destructive">Not Authenticated</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {authState ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Has User</span>
                  {getStatusIcon(authState.hasUser)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Has Session</span>
                  {getStatusIcon(authState.hasSession)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Mode</span>
                  {getStatusIcon(authState.isAdminMode)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Can Use Admin</span>
                  {getStatusIcon(authState.canUseAdminMode)}
                </div>
                {authState.userEmail && (
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-gray-600">{authState.userEmail}</p>
                  </div>
                )}
                {authState.userRole && (
                  <div>
                    <p className="text-sm font-medium">Role</p>
                    <Badge variant="outline">{authState.userRole}</Badge>
                  </div>
                )}
                {authState.sessionExpiry && (
                  <div>
                    <p className="text-sm font-medium">Session Expires</p>
                    <p className="text-xs text-gray-600">{authState.sessionExpiry}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            )}
            <div className="pt-2 border-t">
              <Button onClick={clearSupabaseSession} variant="outline" size="sm">
                Clear Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Browser Storage */}
        <Card>
          <CardHeader>
            <CardTitle>Browser Storage</CardTitle>
            <CardDescription>Local and session storage contents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">localStorage Items</span>
              <Badge variant="outline">{Object.keys(storageData.localStorage).length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">sessionStorage Items</span>
              <Badge variant="outline">{Object.keys(storageData.sessionStorage).length}</Badge>
            </div>
            
            {/* Show key localStorage items */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Key Items:</p>
              {Object.keys(storageData.localStorage)
                .filter(key => key.includes('supabase') || key.includes('auth') || key.includes('admin'))
                .slice(0, 5)
                .map(key => (
                  <p key={key} className="text-xs text-gray-600 truncate">
                    {key}: {String(storageData.localStorage[key]).substring(0, 30)}...
                  </p>
                ))
              }
            </div>
            
            <div className="pt-2 border-t">
              <Button onClick={clearAuthStorage} variant="outline" size="sm">
                Clear Auth Storage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Storage View */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Storage Contents</CardTitle>
          <CardDescription>Full browser storage for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">localStorage</h4>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(storageData.localStorage, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">sessionStorage</h4>
              <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(storageData.sessionStorage, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}