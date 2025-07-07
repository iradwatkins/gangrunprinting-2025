import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Database, PlayCircle, Settings, Plus } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { testAllAdminTables } from '@/utils/database-test';
import { ensureTablesExist, createMissingTables, initializeBasicData } from '@/utils/database-init';

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingData, setIsCreatingData] = useState(false);
  const [results, setResults] = useState<Record<string, { exists: boolean; error?: string; count?: number }> | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await ensureTablesExist();
      setResults(testResults);
    } catch (error) {
      console.error('Database test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      const result = await createMissingTables();
      if (result.success) {
        // Refresh the test results
        await handleTest();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCreateBasicData = async () => {
    setIsCreatingData(true);
    try {
      const result = await initializeBasicData();
      if (result.success) {
        // Refresh the test results
        await handleTest();
      }
    } catch (error) {
      console.error('Basic data creation error:', error);
    } finally {
      setIsCreatingData(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Database Test & Setup</h1>
            <p className="text-muted-foreground">Test database connectivity, initialize tables, and create basic data</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleTest} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <PlayCircle className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Test Database
                </>
              )}
            </Button>
            <Button 
              onClick={handleInitialize} 
              disabled={isInitializing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isInitializing ? (
                <>
                  <Settings className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Initialize Tables
                </>
              )}
            </Button>
            <Button 
              onClick={handleCreateBasicData} 
              disabled={isCreatingData}
              className="flex items-center gap-2"
            >
              {isCreatingData ? (
                <>
                  <Plus className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Basic Data
                </>
              )}
            </Button>
          </div>
        </div>

        {results && (
          <div className="grid gap-4">
            {Object.entries(results).map(([table, result]) => (
              <Card key={table}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    {result.exists ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {table}
                    <Badge variant={result.exists ? "default" : "destructive"}>
                      {result.exists ? "EXISTS" : "MISSING"}
                    </Badge>
                    {result.exists && result.count !== undefined && (
                      <Badge variant="secondary">
                        {result.count} rows
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                  {result.exists && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                      ✓ Table exists and is accessible
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              If tables are missing, you need to run the database migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Quick Fix Process:</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Click <strong>"Test Database"</strong> to check current status</li>
                  <li>If tables are missing, click <strong>"Initialize Tables"</strong> to create them</li>
                  <li>If tables exist but are empty, click <strong>"Create Basic Data"</strong> to populate them</li>
                  <li>Go back to Categories or Paper Stocks pages to verify they now load properly</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Manual Alternative:</h4>
                <p>If automatic initialization fails, run the migration SQL manually in your Supabase dashboard:</p>
                <code className="block bg-muted p-2 rounded text-xs mt-1">
                  supabase/migrations/010_add_missing_global_options.sql
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}