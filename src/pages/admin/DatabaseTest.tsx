import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Database, PlayCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { testAllAdminTables } from '@/utils/database-test';

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, { exists: boolean; error?: string }> | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const testResults = await testAllAdminTables();
      setResults(testResults);
    } catch (error) {
      console.error('Database test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Database Test</h1>
            <p className="text-muted-foreground">Test database connectivity and table existence</p>
          </div>
          <Button 
            onClick={handleTest} 
            disabled={isLoading}
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
            <div className="space-y-2 text-sm">
              <p>1. Click "Test Database" to check table existence</p>
              <p>2. If tables are missing, run the migration SQL in your Supabase dashboard</p>
              <p>3. The migration file is located at: <code>supabase/migrations/010_add_missing_global_options.sql</code></p>
              <p>4. After running the migration, test again to verify</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}