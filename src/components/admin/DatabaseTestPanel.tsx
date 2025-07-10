import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

export function DatabaseTestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runTests = async () => {
    setIsRunning(true);
    clearResults();

    // Test 1: Authentication
    addResult({ test: 'Authentication Check', status: 'pending', message: 'Checking user authentication...' });
    try {
      const user = await auth.getCurrentUser();
      const isAdmin = await auth.isAdmin();
      addResult({ 
        test: 'Authentication Check', 
        status: 'success', 
        message: `User authenticated: ${user?.email || 'Anonymous'}, Admin: ${isAdmin}`,
        details: { user: user?.email, isAdmin, userId: user?.id }
      });
    } catch (error: any) {
      addResult({ test: 'Authentication Check', status: 'error', message: error.message });
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
      </CardHeader>
      <CardContent className="space-y-4">
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