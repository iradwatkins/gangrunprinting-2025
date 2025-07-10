import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/auth';
import { categoriesApi } from '@/api/categories';
import { quantitiesApi } from '@/api/global-options';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

// Environment detection utility
const getEnvironmentInfo = () => {
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  
  let environment = 'unknown';
  let environmentType = 'unknown';
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    environment = 'Development';
    environmentType = 'local';
  } else if (hostname === 'gangrunprinting.com') {
    environment = 'Production (Custom Domain)';
    environmentType = 'production';
  } else if (hostname.includes('vercel.app')) {
    environment = 'Production (Vercel Domain)';
    environmentType = 'production';
  }
  
  return {
    origin,
    hostname,
    environment,
    environmentType,
    userAgent: navigator.userAgent,
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined'
  };
};

export function DatabaseTestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [envInfo] = useState(getEnvironmentInfo());
  const [email, setEmail] = useState('iradwatkins@gmail.com');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const handleMagicLinkLogin = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await auth.signInWithMagicLink(email);
      if (error) {
        addResult({ test: 'Magic Link Login', status: 'error', message: error.message });
      } else {
        addResult({ test: 'Magic Link Login', status: 'success', message: `Magic link sent to ${email}. Check your email and click the link.` });
      }
    } catch (error: any) {
      addResult({ test: 'Magic Link Login', status: 'error', message: error.message });
    }
    setIsAuthenticating(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        addResult({ test: 'Sign Out', status: 'error', message: error.message });
      } else {
        addResult({ test: 'Sign Out', status: 'success', message: 'Successfully signed out' });
        // Refresh the page to clear any cached state
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error: any) {
      addResult({ test: 'Sign Out', status: 'error', message: error.message });
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    clearResults();

    // Test 0: Environment Info
    addResult({ 
      test: 'Environment Detection', 
      status: 'success', 
      message: `Running on: ${envInfo.environment}`,
      details: envInfo
    });

    // Test 1: Enhanced Authentication Check
    addResult({ test: 'Authentication Check', status: 'pending', message: 'Checking user authentication...' });
    try {
      // Get current session directly from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Get user through auth utility
      const user = await auth.getCurrentUser();
      const isAdmin = await auth.isAdmin();
      
      // Check storage
      let localStorageData = null;
      let sessionStorageData = null;
      
      try {
        const authData = localStorage.getItem('supabase.auth.token');
        localStorageData = authData ? 'Present' : 'Missing';
      } catch {
        localStorageData = 'Error accessing';
      }
      
      try {
        const authSessionData = sessionStorage.getItem('supabase.auth.token');
        sessionStorageData = authSessionData ? 'Present' : 'Missing';
      } catch {
        sessionStorageData = 'Error accessing';
      }

      addResult({ 
        test: 'Authentication Check', 
        status: 'success', 
        message: `User: ${user?.email || 'Anonymous'}, Admin: ${isAdmin}, Session: ${session ? 'Active' : 'None'}`,
        details: { 
          user: user?.email,
          userId: user?.id,
          isAdmin,
          sessionActive: !!session,
          sessionError: sessionError?.message,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          refreshToken: session?.refresh_token ? 'Present' : 'Missing',
          localStorage: localStorageData,
          sessionStorage: sessionStorageData,
          environment: envInfo.environment,
          domain: envInfo.hostname
        }
      });
    } catch (error: any) {
      addResult({ test: 'Authentication Check', status: 'error', message: error.message, details: { error: error.stack } });
    }

    // Test 2: Categories Read
    addResult({ test: 'Categories Read', status: 'pending', message: 'Testing categories read access...' });
    try {
      const response = await categoriesApi.getAll();
      if (response.error) {
        addResult({ test: 'Categories Read', status: 'error', message: response.error });
      } else {
        addResult({ 
          test: 'Categories Read', 
          status: 'success', 
          message: `Successfully read ${response.data?.length || 0} categories`,
          details: response.data?.slice(0, 3)
        });
      }
    } catch (error: any) {
      addResult({ test: 'Categories Read', status: 'error', message: error.message });
    }

    // Test 3: Categories Write
    addResult({ test: 'Categories Write', status: 'pending', message: 'Testing categories write access...' });
    try {
      const testCategory = {
        name: 'Test Category ' + Date.now(),
        slug: 'test-category-' + Date.now(),
        description: 'Test category for database access verification',
        is_active: false,
        sort_order: 999
      };
      
      const created = await categoriesApi.create(testCategory);
      
      // Clean up - delete the test category
      await categoriesApi.delete(created.id);
      
      addResult({ 
        test: 'Categories Write', 
        status: 'success', 
        message: 'Successfully created and deleted test category',
        details: { created: created.name }
      });
    } catch (error: any) {
      addResult({ test: 'Categories Write', status: 'error', message: error.message });
    }

    // Test 4: Quantities Read
    addResult({ test: 'Quantities Read', status: 'pending', message: 'Testing quantities read access...' });
    try {
      const response = await quantitiesApi.getAll();
      if (response.error) {
        addResult({ test: 'Quantities Read', status: 'error', message: response.error });
      } else {
        addResult({ 
          test: 'Quantities Read', 
          status: 'success', 
          message: `Successfully read ${response.data?.length || 0} quantity groups`,
          details: response.data?.slice(0, 3)
        });
      }
    } catch (error: any) {
      addResult({ test: 'Quantities Read', status: 'error', message: error.message });
    }

    // Test 5: Quantities Write
    addResult({ test: 'Quantities Write', status: 'pending', message: 'Testing quantities write access...' });
    try {
      const testQuantity = {
        name: 'Test Quantity Group ' + Date.now(),
        values: '100,250,500,1000',
        default_value: 250,
        has_custom: true,
        is_active: false
      };
      
      const created = await quantitiesApi.create(testQuantity);
      
      // Clean up - delete the test quantity
      await quantitiesApi.delete(created.id);
      
      addResult({ 
        test: 'Quantities Write', 
        status: 'success', 
        message: 'Successfully created and deleted test quantity group',
        details: { created: created.name }
      });
    } catch (error: any) {
      addResult({ test: 'Quantities Write', status: 'error', message: error.message });
    }

    // Test 6: Direct Database Query
    addResult({ test: 'Direct Database Query', status: 'pending', message: 'Testing direct Supabase query...' });
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role')
        .limit(1);

      if (error) {
        addResult({ test: 'Direct Database Query', status: 'error', message: error.message });
      } else {
        addResult({ 
          test: 'Direct Database Query', 
          status: 'success', 
          message: 'Successfully queried user_profiles table',
          details: data
        });
      }
    } catch (error: any) {
      addResult({ test: 'Direct Database Query', status: 'error', message: error.message });
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Operations Test Panel</CardTitle>
        <CardDescription>
          Test database connectivity, authentication, and CRUD operations to diagnose saving issues.
        </CardDescription>
        
        {/* Environment Information */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Current Environment</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="font-medium">Environment:</span> {envInfo.environment}</div>
            <div><span className="font-medium">Domain:</span> {envInfo.hostname}</div>
            <div><span className="font-medium">Origin:</span> {envInfo.origin}</div>
            <div><span className="font-medium">Storage:</span> {envInfo.localStorage ? 'Available' : 'Blocked'}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Controls */}
        <div className="space-y-3 p-3 border rounded-lg">
          <h4 className="font-semibold text-sm">Authentication Controls</h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label htmlFor="email" className="text-xs">Email for Magic Link</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="h-8 text-sm"
              />
            </div>
            <Button 
              onClick={handleMagicLinkLogin} 
              disabled={isAuthenticating || !email}
              size="sm"
            >
              {isAuthenticating ? 'Sending...' : 'Send Magic Link'}
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              size="sm"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <Separator />

        {/* Test Controls */}
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button variant="outline" onClick={clearResults} disabled={isRunning}>
            Clear Results
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
            {results.map((result, index) => (
              <Alert key={index} className="p-3">
                <AlertDescription>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getStatusIcon(result.status)}</span>
                        <span className="font-medium">{result.test}</span>
                        <Badge variant={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-muted-foreground">
                            View Details
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}