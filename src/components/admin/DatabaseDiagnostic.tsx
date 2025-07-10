import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: any;
  duration?: number;
}

export function DatabaseDiagnostic() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: DiagnosticResult['status'], message?: string, data?: any, duration?: number) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, data, duration } : r);
      }
      return [...prev, { test, status, message, data, duration }];
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Basic Supabase Connection
    const startTime1 = Date.now();
    updateResult('Basic Connection', 'running');
    try {
      const { data, error } = await Promise.race([
        supabase.from('user_profiles').select('id').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any;
      
      const duration1 = Date.now() - startTime1;
      if (error) {
        updateResult('Basic Connection', 'error', error.message, null, duration1);
      } else {
        updateResult('Basic Connection', 'success', `Connected successfully (${duration1}ms)`, data, duration1);
      }
    } catch (error) {
      const duration1 = Date.now() - startTime1;
      updateResult('Basic Connection', 'error', (error as Error).message, null, duration1);
    }

    // Test 2: Quantities Table Existence
    const startTime2 = Date.now();
    updateResult('Quantities Table', 'running');
    try {
      const { data, error } = await Promise.race([
        supabase.from('quantities').select('id').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000))
      ]) as any;
      
      const duration2 = Date.now() - startTime2;
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          updateResult('Quantities Table', 'error', 'Table does not exist', null, duration2);
        } else {
          updateResult('Quantities Table', 'error', error.message, error, duration2);
        }
      } else {
        updateResult('Quantities Table', 'success', `Table accessible (${duration2}ms)`, data, duration2);
      }
    } catch (error) {
      const duration2 = Date.now() - startTime2;
      updateResult('Quantities Table', 'error', (error as Error).message, null, duration2);
    }

    // Test 3: Table Schema Check
    const startTime3 = Date.now();
    updateResult('Schema Check', 'running');
    try {
      // Try old schema first
      const { data: oldData, error: oldError } = await Promise.race([
        supabase.from('quantities').select('id, name, value, is_custom, is_active').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]) as any;
      
      const duration3 = Date.now() - startTime3;
      
      if (!oldError && oldData !== undefined) {
        updateResult('Schema Check', 'success', `Old schema detected (${duration3}ms)`, { schema: 'old', fields: ['name', 'value', 'is_custom'] }, duration3);
      } else {
        // Try new schema
        const { data: newData, error: newError } = await Promise.race([
          supabase.from('quantities').select('id, name, values, default_value, has_custom, is_active').limit(1),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]) as any;
        
        if (!newError && newData !== undefined) {
          updateResult('Schema Check', 'success', `New schema detected (${duration3}ms)`, { schema: 'new', fields: ['name', 'values', 'default_value', 'has_custom'] }, duration3);
        } else {
          updateResult('Schema Check', 'error', `Schema detection failed: ${newError?.message || 'Unknown error'}`, { oldError, newError }, duration3);
        }
      }
    } catch (error) {
      const duration3 = Date.now() - startTime3;
      updateResult('Schema Check', 'error', (error as Error).message, null, duration3);
    }

    // Test 4: Simple Insert Test (if table exists)
    const quantitiesResult = results.find(r => r.test === 'Quantities Table');
    if (quantitiesResult?.status === 'success') {
      const startTime4 = Date.now();
      updateResult('Insert Test', 'running');
      try {
        const testData = {
          name: 'DIAGNOSTIC_TEST_' + Date.now(),
          values: '1,2,3',
          default_value: 1,
          has_custom: false,
          is_active: false
        };

        const { data, error } = await Promise.race([
          supabase.from('quantities').insert(testData).select().single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Insert timeout')), 5000))
        ]) as any;
        
        const duration4 = Date.now() - startTime4;
        
        if (error) {
          updateResult('Insert Test', 'error', error.message, error, duration4);
        } else {
          updateResult('Insert Test', 'success', `Insert successful (${duration4}ms)`, data, duration4);
          
          // Clean up test data
          if (data?.id) {
            await supabase.from('quantities').delete().eq('id', data.id);
          }
        }
      } catch (error) {
        const duration4 = Date.now() - startTime4;
        updateResult('Insert Test', 'error', (error as Error).message, null, duration4);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'running': return <Badge variant="secondary">Running</Badge>;
      case 'success': return <Badge className="bg-green-500">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Database Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runDiagnostics} disabled={isRunning}>
            {isRunning ? 'Running Diagnostics...' : 'Run Database Diagnostics'}
          </Button>
          
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.test} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    {result.duration && (
                      <span className="text-xs text-gray-500">{result.duration}ms</span>
                    )}
                  </div>
                </div>
              ))}
              
              {results.map((result) => (
                result.message && (
                  <div key={`${result.test}-details`} className="text-sm text-gray-600 ml-6">
                    {result.message}
                    {result.data && (
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}