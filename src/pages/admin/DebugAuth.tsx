import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/hooks/useSession';

export function DebugAuth() {
  const { user, profile, isLoading, isInitialized } = useSession();
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [directResult, setDirectResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testRPC = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.rpc('get_or_create_profile');
      if (error) {
        setError(`RPC Error: ${error.message}`);
        setRpcResult(null);
      } else {
        setRpcResult(data);
      }
    } catch (e: any) {
      setError(`Exception: ${e.message}`);
    }
  };

  const testDirect = async () => {
    if (!user) return;
    try {
      setError(null);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        setError(`Direct Query Error: ${error.message}`);
        setDirectResult(null);
      } else {
        setDirectResult(data);
      }
    } catch (e: any) {
      setError(`Exception: ${e.message}`);
    }
  };

  const testAdminTable = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        setError(`Admin Table Error: ${error.message}`);
      } else {
        console.log('Admin users:', data);
        alert(`Found ${data?.length || 0} admin users. Check console.`);
      }
    } catch (e: any) {
      setError(`Exception: ${e.message}`);
    }
  };

  const fixProfile = async () => {
    if (!user) return;
    try {
      setError(null);
      // First ensure user is in admin_users table
      await supabase
        .from('admin_users')
        .upsert({ 
          email: user.email,
          notes: 'Added via debug tool' 
        }, { onConflict: 'email' });

      // Then update profile
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          role: 'admin',
          full_name: user.user_metadata?.full_name || 'Admin User',
          is_broker: false,
          broker_category_discounts: {}
        }, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) {
        setError(`Fix Error: ${error.message}`);
      } else {
        alert('Profile fixed! Please refresh the page.');
        window.location.reload();
      }
    } catch (e: any) {
      setError(`Exception: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Auth Debug Tool</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session State</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({
              isLoading,
              isInitialized,
              user: user ? {
                id: user.id,
                email: user.email,
                role: user.role
              } : null,
              profile: profile ? {
                id: profile.id,
                user_id: profile.user_id,
                email: profile.email,
                role: profile.role
              } : null
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Functions</CardTitle>
          <CardDescription>Test various authentication methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testRPC}>Test RPC Function</Button>
            <Button onClick={testDirect}>Test Direct Query</Button>
            <Button onClick={testAdminTable}>Check Admin Table</Button>
            <Button onClick={fixProfile} variant="destructive">Fix My Profile</Button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded">
              {error}
            </div>
          )}
          
          {rpcResult && (
            <div>
              <h3 className="font-semibold">RPC Result:</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(rpcResult, null, 2)}
              </pre>
            </div>
          )}
          
          {directResult && (
            <div>
              <h3 className="font-semibold">Direct Query Result:</h3>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(directResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}