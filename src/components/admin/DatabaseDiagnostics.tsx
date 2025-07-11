import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { insertRealTestData } from '@/utils/insertRealTestData';

export function DatabaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [insertResult, setInsertResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Check Supabase connection
      results.connection = { status: 'checking' };
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.connection = {
        status: sessionError ? 'error' : 'success',
        error: sessionError?.message,
        hasSession: !!sessionData?.session,
        user: sessionData?.session?.user?.email
      };

      // Test 2: Check database permissions
      results.permissions = { status: 'checking' };
      const tables = [
        'product_categories', 'products', 'paper_stocks', 'coatings', 
        'print_sizes', 'turnaround_times', 'add_ons', 'quantities', 'sides'
      ];
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: false })
            .limit(1);
          
          results.permissions[table] = {
            canRead: !error,
            error: error?.message,
            count: count || 0,
            hasData: (data && data.length > 0) || false
          };
        } catch (err: any) {
          results.permissions[table] = {
            canRead: false,
            error: err.message,
            count: 0,
            hasData: false
          };
        }
      }

      // Test 3: Try a simple insert
      results.insertTest = { status: 'checking' };
      try {
        const testCoating = {
          name: 'Test Coating ' + Date.now(),
          description: 'Test coating for diagnostics',
          price_multiplier: 1.0,
          is_active: true,
          sort_order: 999
        };

        const { data, error } = await supabase
          .from('coatings')
          .insert(testCoating)
          .select()
          .single();

        if (error) {
          results.insertTest = {
            status: 'error',
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          };
        } else {
          results.insertTest = {
            status: 'success',
            insertedId: data?.id
          };

          // Clean up test data
          if (data?.id) {
            await supabase.from('coatings').delete().eq('id', data.id);
          }
        }
      } catch (err: any) {
        results.insertTest = {
          status: 'error',
          error: err.message
        };
      }

    } catch (error: any) {
      results.error = error.message;
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const handleInsertTestData = async () => {
    setLoading(true);
    setInsertResult(null);
    try {
      const result = await insertRealTestData();
      setInsertResult(result);
      // Refresh diagnostics after insertion
      if (result.success) {
        await runDiagnostics();
      }
    } catch (error: any) {
      setInsertResult({ success: false, error: error.message });
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Database Diagnostics</CardTitle>
              <CardDescription>
                Test database connection and permissions
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={runDiagnostics}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </Button>
            
            <Button
              size="sm"
              onClick={handleInsertTestData}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Insert Test Data
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          {diagnostics.connection && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Connection Status</h3>
                {getStatusIcon(diagnostics.connection.status)}
              </div>
              <div className="text-sm space-y-1">
                <p>Status: <Badge variant={diagnostics.connection.status === 'success' ? 'default' : 'destructive'}>
                  {diagnostics.connection.status}
                </Badge></p>
                {diagnostics.connection.user && (
                  <p>User: {diagnostics.connection.user}</p>
                )}
                {diagnostics.connection.error && (
                  <p className="text-red-600">Error: {diagnostics.connection.error}</p>
                )}
              </div>
            </div>
          )}

          {/* Table Permissions */}
          {diagnostics.permissions && Object.keys(diagnostics.permissions).length > 1 && (
            <div>
              <h3 className="font-medium mb-3">Table Permissions & Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(diagnostics.permissions).map(([table, info]: any) => {
                  if (table === 'status') return null;
                  return (
                    <div key={table} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{table}</span>
                        {info.canRead ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {info.canRead ? (
                          <span>{info.count} records</span>
                        ) : (
                          <span className="text-red-600">Cannot read</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insert Test Results */}
          {diagnostics.insertTest && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Insert Test</h3>
                {getStatusIcon(diagnostics.insertTest.status)}
              </div>
              <div className="text-sm">
                {diagnostics.insertTest.status === 'success' ? (
                  <p className="text-green-600">Can insert data successfully</p>
                ) : (
                  <div>
                    <p className="text-red-600">Cannot insert data</p>
                    {diagnostics.insertTest.error && (
                      <p className="text-xs mt-1">Error: {diagnostics.insertTest.error}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Data Insert Result */}
          {insertResult && (
            <Alert className={insertResult.success ? 'border-green-600' : 'border-red-600'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {insertResult.success ? (
                  <div>
                    <p className="font-medium">✅ Test data inserted successfully!</p>
                    <p className="text-sm mt-1">
                      Total records inserted: {insertResult.summary?.totalInserted || 0}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">❌ Error inserting test data</p>
                    <p className="text-sm mt-1">{insertResult.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {!diagnostics.connection && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Instructions:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Click "Run Diagnostics" to test your database connection</li>
                  <li>If tables show 0 records, click "Insert Test Data"</li>
                  <li>Check the Database Health Check below for real-time counts</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}