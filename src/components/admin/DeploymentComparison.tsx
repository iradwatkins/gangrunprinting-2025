import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Globe, Database, User, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { categoriesApi } from '@/api/categories';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/contexts/AuthContext';

interface DeploymentInfo {
  url: string;
  timestamp: string;
  userAgent: string;
}

interface AuthInfo {
  isAuthenticated: boolean;
  userId?: string;
  userEmail?: string;
  hasSession: boolean;
  isAdmin: boolean;
  adminModeActive: boolean;
}

interface DatabaseInfo {
  categoriesCount: number;
  querySuccess: boolean;
  error?: string;
  responseTime: number;
}

export function DeploymentComparison() {
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [browserStorage, setBrowserStorage] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { isAdminMode } = useAdminMode();
  const { user, isAuthenticated } = useAuth();

  const collectDeploymentInfo = () => {
    setDeploymentInfo({
      url: window.location.origin,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  };

  const collectAuthInfo = async () => {
    try {
      const { data: { user: supabaseUser, session } } = await supabase.auth.getUser();
      
      setAuthInfo({
        isAuthenticated,
        userId: supabaseUser?.id,
        userEmail: supabaseUser?.email,
        hasSession: !!session,
        isAdmin: user?.role === 'admin',
        adminModeActive: isAdminMode
      });
    } catch (error) {
      console.error('Error collecting auth info:', error);
    }
  };

  const collectDatabaseInfo = async () => {
    try {
      const startTime = Date.now();
      const response = await categoriesApi.getAll();
      const responseTime = Date.now() - startTime;
      
      setDatabaseInfo({
        categoriesCount: response.data?.length || 0,
        querySuccess: !response.error,
        error: response.error,
        responseTime
      });
    } catch (error) {
      setDatabaseInfo({
        categoriesCount: 0,
        querySuccess: false,
        error: (error as Error).message,
        responseTime: 0
      });
    }
  };

  const collectBrowserStorage = () => {
    const storage: Record<string, any> = {};
    
    // LocalStorage
    storage.localStorage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          storage.localStorage[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          storage.localStorage[key] = localStorage.getItem(key);
        }
      }
    }
    
    // SessionStorage
    storage.sessionStorage = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          storage.sessionStorage[key] = JSON.parse(sessionStorage.getItem(key) || '');
        } catch {
          storage.sessionStorage[key] = sessionStorage.getItem(key);
        }
      }
    }
    
    setBrowserStorage(storage);
  };

  const runFullDiagnostic = async () => {
    setIsLoading(true);
    try {
      collectDeploymentInfo();
      await collectAuthInfo();
      await collectDatabaseInfo();
      collectBrowserStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearBrowserData = () => {
    if (confirm('This will clear all localStorage and sessionStorage data. Continue?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  useEffect(() => {
    runFullDiagnostic();
  }, []);

  const getStatusColor = (success: boolean) => success ? 'default' : 'destructive';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Deployment Comparison</h2>
          <p className="text-gray-600">Debug tool to identify differences between deployments</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runFullDiagnostic} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Diagnostic
          </Button>
          <Button variant="outline" onClick={clearBrowserData}>
            <Settings className="mr-2 h-4 w-4" />
            Clear Browser Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Deployment Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-4 w-4" />
              Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {deploymentInfo ? (
              <>
                <div>
                  <p className="text-sm font-medium">URL</p>
                  <p className="text-xs text-gray-600 break-all">{deploymentInfo.url}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Timestamp</p>
                  <p className="text-xs text-gray-600">{new Date(deploymentInfo.timestamp).toLocaleString()}</p>
                </div>
                <Badge variant={deploymentInfo.url.includes('vercel') ? 'default' : 'secondary'}>
                  {deploymentInfo.url.includes('vercel') ? 'Vercel Preview' : 'Production'}
                </Badge>
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Auth Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {authInfo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Authenticated</span>
                  <Badge variant={getStatusColor(authInfo.isAuthenticated)}>
                    {authInfo.isAuthenticated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Admin Role</span>
                  <Badge variant={getStatusColor(authInfo.isAdmin)}>
                    {authInfo.isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Admin Mode</span>
                  <Badge variant={getStatusColor(authInfo.adminModeActive)}>
                    {authInfo.adminModeActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {authInfo.userEmail && (
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-gray-600 break-all">{authInfo.userEmail}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {databaseInfo ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm">Query Success</span>
                  <Badge variant={getStatusColor(databaseInfo.querySuccess)}>
                    {databaseInfo.querySuccess ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Categories</span>
                  <Badge variant="outline">{databaseInfo.categoriesCount}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Response Time</span>
                  <Badge variant="outline">{databaseInfo.responseTime}ms</Badge>
                </div>
                {databaseInfo.error && (
                  <Alert>
                    <AlertDescription className="text-xs">{databaseInfo.error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* Browser Storage Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-4 w-4" />
              Browser Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">localStorage Items</span>
              <Badge variant="outline">
                {Object.keys(browserStorage.localStorage || {}).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">sessionStorage Items</span>
              <Badge variant="outline">
                {Object.keys(browserStorage.sessionStorage || {}).length}
              </Badge>
            </div>
            <div className="space-y-1">
              {Object.keys(browserStorage.localStorage || {}).slice(0, 3).map(key => (
                <p key={key} className="text-xs text-gray-600 truncate">
                  {key}
                </p>
              ))}
              {Object.keys(browserStorage.localStorage || {}).length > 3 && (
                <p className="text-xs text-gray-500">
                  +{Object.keys(browserStorage.localStorage || {}).length - 3} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Browser Storage */}
      {Object.keys(browserStorage).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Browser Storage</CardTitle>
            <CardDescription>Complete browser storage contents for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(browserStorage, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}