import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isAdmin, signIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        setError(result.error || "Login failed");
      }
      // Success redirect will be handled by useEffect above
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setError(
      "Using test credentials - make sure admin@example.com exists in your Supabase Auth",
    );
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Show success if already logged in
  if (user && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Alert className="border-green-600 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Already logged in as admin: {user.email}
            <br />
            Redirecting to admin panel...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin panel</CardDescription>
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
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTestLogin}
                disabled={loading}
              >
                Use Test Credentials
              </Button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
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
    </div>
  );
}
