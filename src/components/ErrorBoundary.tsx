import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if this is an authentication error
    if (error.message && (error.message.includes('useSession must be used within') || error.message.includes('Profile loading timeout'))) {
      console.error('Authentication error detected:', error.message);
      sessionStorage.setItem('auth_error', error.message);
      // Don't render error UI for auth errors - let AuthErrorBoundary handle it
      window.location.reload();
      return;
    }
    
    // Check if this is the vendor address rendering error
    if (error.message && (error.message.includes('object with keys') || error.message.includes('Objects are not valid as a React child'))) {
      console.error('Detected object rendering error. This often happens when trying to render an address object directly.');
      console.error('Component stack:', errorInfo.componentStack);
    }
    
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                We encountered an unexpected error. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show specific help for the vendor address error */}
              {this.state.error?.message && (this.state.error.message.includes('object with keys') || this.state.error.message.includes('Objects are not valid')) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    Data formatting issue detected
                  </p>
                  <p className="text-sm text-yellow-800">
                    This error typically occurs when vendor address data needs to be updated to the new format.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-sm text-yellow-800 mt-2">
                      <strong>Admin action needed:</strong> Visit <a href="/admin" className="underline">Admin Dashboard</a> and use the "Fix Vendor Addresses" tool.
                    </p>
                  )}
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <Button onClick={this.handleReset} className="w-full">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}