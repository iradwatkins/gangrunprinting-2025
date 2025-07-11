import { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TableInfo {
  name: string;
  count: number;
  status: 'loading' | 'success' | 'error';
  error?: string;
  samples?: any[];
}

export function DatabaseHealthCheck() {
  const [tables, setTables] = useState<Record<string, TableInfo>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [supabaseUrl, setSupabaseUrl] = useState('');

  const tableList = [
    'product_categories',
    'vendors',
    'products',
    'paper_stocks',
    'coatings',
    'turnaround_times',
    'print_sizes',
    'quantities',
    'sides',
    'add_ons',
    'product_paper_stocks',
    'product_print_sizes',
    'product_turnaround_times',
    'product_add_ons'
  ];

  useEffect(() => {
    checkConnection();
    refreshData();
  }, []);

  const checkConnection = async () => {
    try {
      setSupabaseUrl(supabase.supabaseUrl);
      // Simple query to test connection
      const { error } = await supabase.from('product_categories').select('id').limit(1);
      if (error) throw error;
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    for (const tableName of tableList) {
      setTables(prev => ({
        ...prev,
        [tableName]: { name: tableName, count: 0, status: 'loading' }
      }));

      try {
        // Get count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // Get sample records
        const { data: samples, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (sampleError) throw sampleError;

        setTables(prev => ({
          ...prev,
          [tableName]: {
            name: tableName,
            count: count || 0,
            status: 'success',
            samples: samples || []
          }
        }));
      } catch (error: any) {
        setTables(prev => ({
          ...prev,
          [tableName]: {
            name: tableName,
            count: 0,
            status: 'error',
            error: error.message
          }
        }));
      }
    }

    setIsRefreshing(false);
  };

  const getTotalRecords = () => {
    return Object.values(tables).reduce((sum, table) => sum + (table.count || 0), 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <CardTitle>Database Health Check</CardTitle>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Monitor database connection and table data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Connection Status</p>
                <p className="text-xs text-gray-600 mt-1">
                  {supabaseUrl ? `Connected to: ${supabaseUrl.substring(0, 30)}...` : 'Checking connection...'}
                </p>
              </div>
              <Badge className={getStatusColor(connectionStatus)}>
                <Activity className="h-3 w-3 mr-1" />
                {connectionStatus}
              </Badge>
            </div>

            {/* Total Records */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Total Records in Database</p>
              <p className="text-2xl font-bold text-blue-600">{getTotalRecords()}</p>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tableList.map(tableName => {
                const table = tables[tableName] || { name: tableName, count: 0, status: 'loading' };
                return (
                  <div 
                    key={tableName} 
                    className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{tableName}</h4>
                      {getStatusIcon(table.status)}
                    </div>
                    
                    {table.status === 'success' ? (
                      <>
                        <p className="text-2xl font-bold text-gray-900">{table.count}</p>
                        <p className="text-xs text-gray-600">records</p>
                        
                        {table.samples && table.samples.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs text-gray-500 mb-1">Latest:</p>
                            <p className="text-xs text-gray-700 truncate">
                              {table.samples[0].name || table.samples[0].id?.substring(0, 8)}
                            </p>
                          </div>
                        )}
                      </>
                    ) : table.status === 'error' ? (
                      <p className="text-xs text-red-600">{table.error}</p>
                    ) : (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Quick Actions:</p>
                <ul className="text-sm space-y-1">
                  <li>• Open browser console and run <code className="bg-gray-100 px-1">insertCompleteTestData()</code> to add test data</li>
                  <li>• Visit admin pages to verify CRUD operations are working</li>
                  <li>• Check React Query DevTools for caching status</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}