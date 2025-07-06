import { useState } from 'react';
import { Mail, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const magicLinkSchema = z.object({
  email: z.string().email('Invalid email address')
});

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signInWithMagicLink, signInWithGoogle } = useAuth();


  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      magicLinkSchema.parse({ email: magicLinkEmail });
      setErrors({});
      const result = await signInWithMagicLink(magicLinkEmail);
      
      if (result.error) {
        setErrors({ magicLink: result.error });
      } else {
        setMagicLinkSent(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ magicLink: 'Please enter a valid email address' });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    
    if (result.error) {
      setErrors({ google: result.error });
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to GangRun Printing</DialogTitle>
          <DialogDescription className="text-center">
            Choose your preferred way to sign in or create an account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Magic Link - Primary Method */}
          <div className="p-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                Magic Link Sign In
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No password needed - just click the link we email you
              </p>
            </div>
            
            {magicLinkSent ? (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Check your email!</strong> We've sent you a secure sign-in link. Click it to access your account.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Send Magic Link
                </Button>
                {errors.magicLink && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.magicLink}</p>
                )}
              </form>
            )}
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google OAuth - Secondary Method */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="w-full h-12 flex items-center justify-center space-x-3 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">Continue with Google</span>
            </Button>
            {errors.google && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{errors.google}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white mb-1">Secure & Private</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your account is protected with industry-standard encryption. We never store passwords when you use magic links.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            <p>
              By continuing, you agree to our{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                Privacy Policy
              </Button>
            </p>
            <p className="mt-2">
              Need help?{' '}
              <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                Contact Support
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}