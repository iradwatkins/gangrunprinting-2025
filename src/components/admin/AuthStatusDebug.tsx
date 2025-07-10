import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle, XCircle, Info } from 'lucide-react';

export function AuthStatusDebug() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setError(`Auth error: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No authenticated user');
        setLoading(false);
        return;
      }

      setUser(user);

      // Get user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        setError(`Profile error: ${profileError.message}`);
      } else {
        setProfile(profile);
      }
    } catch (err) {
      setError(`Exception: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Checking authentication status...</AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={error ? 'destructive' : 'default'}>
      <User className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <strong>Auth Status:</strong>
            {user ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Authenticated as {user.email}</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Not authenticated</span>
              </>
            )}
          </div>
          
          {profile && (
            <div className="flex items-center gap-2">
              <strong>Admin Status:</strong>
              {profile.is_admin ? (
                <Badge variant="default" className="bg-green-600">Admin</Badge>
              ) : (
                <Badge variant="destructive">Not Admin</Badge>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mt-2">
              <strong>Error:</strong> {error}
            </div>
          )}

          {user && !profile?.is_admin && (
            <div className="text-amber-600 text-sm mt-2">
              <strong>Note:</strong> You need admin privileges to create quantity groups.
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}