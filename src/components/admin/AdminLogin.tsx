import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        // Refresh the page after successful login
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    // Use test credentials (you should set these up in Supabase)
    setEmail('admin@example.com');
    setPassword('admin123');
    setError('Using test credentials - make sure admin@example.com exists in your Supabase Auth');
  };

  if (user) {
    return (
      <Alert className="border-green-600">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ✅ Logged in as: {user.email}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
        <CardDescription>
          Sign in to access admin features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTestLogin}
            >
              Use Test Credentials
            </Button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-medium">Quick Setup:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Go to Supabase Dashboard → Authentication → Users</li>
            <li>Create a new user with email: admin@example.com</li>
            <li>Set password: admin123</li>
            <li>Or use your existing admin credentials</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}