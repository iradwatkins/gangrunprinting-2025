import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, Loader2, AlertCircle, Mail, Chrome, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SimplifiedAuthModalProps {
  defaultTab?: 'login' | 'signup';
  redirectPath?: string;
  onSuccess?: () => void;
}

export function SimplifiedAuthModal({ 
  defaultTab = 'login', 
  redirectPath,
  onSuccess 
}: SimplifiedAuthModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithMagicLink, signInWithGoogle, loading, error, clearError } = useAuth();
  
  // Form states
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Get redirect path from location state or prop or default
  const from = redirectPath || (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    
    try {
      const result = await signIn(loginEmail, loginPassword);
      if (result.success) {
        onSuccess?.();
        navigate(from, { replace: true });
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const result = await signUp(signupEmail, signupPassword, {
        first_name: signupFirstName,
        last_name: signupLastName,
      });
      
      if (result.success) {
        // Clear form
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setSignupFirstName('');
        setSignupLastName('');
        
        toast.success('Account created! Please check your email to verify your account.');
        setActiveTab('login');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!loginEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const { error } = await signInWithMagicLink(loginEmail);
      if (!error) {
        toast.success('Check your email for the login link!');
        setLoginEmail('');
      } else {
        toast.error(error);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error);
      } else {
        onSuccess?.();
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Welcome to GangRun Printing</CardTitle>
        <CardDescription className="text-center">
          Sign in to access your account and manage orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as 'login' | 'signup');
          clearError?.();
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="login" className="space-y-4 mt-4">
            {/* Email/Password Login */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs"
                    onClick={() => navigate('/password-reset')}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Alternative Login Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleMagicLink}
                disabled={isLoading || !loginEmail}
                title={!loginEmail ? "Enter your email above first" : "Send magic link to your email"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Magic Link
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-first-name">First Name</Label>
                  <Input
                    id="signup-first-name"
                    type="text"
                    placeholder="John"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-last-name">Last Name</Label>
                  <Input
                    id="signup-last-name"
                    type="text"
                    placeholder="Doe"
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}