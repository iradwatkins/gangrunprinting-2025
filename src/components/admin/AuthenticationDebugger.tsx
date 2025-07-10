import React, { useEffect, useState } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Database, Network, Code, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AuthDebugInfo {
  // Authentication State
  authState: {
    isAuthenticated: boolean;
    user: any;
    profile: any;
    loading: boolean;
    error: string | null;
  };
  
  // Supabase Session
  supabaseSession: any;
  
  // Local Storage
  localStorage: {
    authToken: string | null;
    refreshToken: string | null;
    expiresAt: string | null;
  };
  
  // Network Status
  networkStatus: {
    online: boolean;
    supabaseConnected: boolean;
    lastAuthCheck: string | null;
  };
  
  // Environment
  environment: {
    supabaseUrl: string;
    supabaseKey: string;
    nodeEnv: string;
    isDevelopment: boolean;
  };
  
  // Recent Auth Events
  authEvents: Array<{
    timestamp: string;
    event: string;
    details: any;
  }>;
}

export const AuthenticationDebugger: React.FC = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [authEvents, setAuthEvents] = useState<AuthDebugInfo['authEvents']>([]);

  const addAuthEvent = (event: string, details: any) => {
    const newEvent = {
      timestamp: new Date().toISOString(),
      event,
      details
    };
    setAuthEvents(prev => [newEvent, ...prev].slice(0, 10)); // Keep last 10 events
  };

  const checkSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  };

  const gatherDebugInfo = async () => {
    try {
      // Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        addAuthEvent('session_error', sessionError);
      } else {
        addAuthEvent('session_check', { hasSession: !!session });
      }

      // Check localStorage
      const authTokenKey = 'sb-dprvugzbsqcufitbxkda-auth-token';
      const authToken = localStorage.getItem(authTokenKey);
      let parsedAuthToken = null;
      
      if (authToken) {
        try {
          parsedAuthToken = JSON.parse(authToken);
        } catch {
          parsedAuthToken = authToken;
        }
      }

      // Check Supabase connection
      const isConnected = await checkSupabaseConnection();

      // Gather all debug info
      const info: AuthDebugInfo = {
        authState: {
          isAuthenticated,
          user: user ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            role: user.role,
            user_metadata: user.user_metadata
          } : null,
          profile: profile ? {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            is_admin: profile.is_admin,
            created_at: profile.created_at
          } : null,
          loading,
          error: null
        },
        supabaseSession: session ? {
          access_token: session.access_token ? '***' + session.access_token.slice(-10) : null,
          refresh_token: session.refresh_token ? '***' + session.refresh_token.slice(-10) : null,
          expires_at: session.expires_at,
          expires_in: session.expires_in,
          user: session.user ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          } : null
        } : null,
        localStorage: {
          authToken: parsedAuthToken ? JSON.stringify(parsedAuthToken, null, 2) : null,
          refreshToken: parsedAuthToken?.refresh_token ? '***' + parsedAuthToken.refresh_token.slice(-10) : null,
          expiresAt: parsedAuthToken?.expires_at || null
        },
        networkStatus: {
          online: navigator.onLine,
          supabaseConnected: isConnected,
          lastAuthCheck: new Date().toISOString()
        },
        environment: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-10) : 'Not set',
          nodeEnv: import.meta.env.NODE_ENV || 'Not set',
          isDevelopment: import.meta.env.DEV || false
        },
        authEvents
      };

      setDebugInfo(info);
    } catch (error) {
      console.error('Error gathering debug info:', error);
      addAuthEvent('debug_error', error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addAuthEvent(event, {
        hasSession: !!session,
        userId: session?.user?.id
      });
      
      // Refresh debug info on auth state change
      setTimeout(gatherDebugInfo, 100);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Initial load and periodic refresh
  useEffect(() => {
    gatherDebugInfo();
    const interval = setInterval(gatherDebugInfo, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user, profile, loading, isAuthenticated]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="w-4 h-4 text-gray-400" />;
    return status ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const formatJson = (obj: any) => {
    if (!obj) return 'null';
    if (typeof obj === 'string') return obj;
    return JSON.stringify(obj, null, 2);
  };

  if (!debugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
      >
        <Shield className="w-5 h-5" />
        Auth Debug
        {getStatusIcon(debugInfo.authState.isAuthenticated)}
      </button>

      {isExpanded && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Authentication Debugger</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Quick Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.authState.isAuthenticated)}
              <span className="text-sm">
                Authentication: {debugInfo.authState.isAuthenticated ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.supabaseSession !== null)}
              <span className="text-sm">
                Session: {debugInfo.supabaseSession ? 'Valid' : 'None'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.networkStatus.online)}
              <span className="text-sm">
                Network: {debugInfo.networkStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.networkStatus.supabaseConnected)}
              <span className="text-sm">
                Supabase: {debugInfo.networkStatus.supabaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-4">
            {/* Auth State */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Auth Context State
              </h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {formatJson(debugInfo.authState)}
              </pre>
            </div>

            {/* Supabase Session */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Supabase Session
              </h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {formatJson(debugInfo.supabaseSession)}
              </pre>
            </div>

            {/* Local Storage */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Local Storage
              </h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {formatJson(debugInfo.localStorage)}
              </pre>
            </div>

            {/* Environment */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Environment
              </h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                {formatJson(debugInfo.environment)}
              </pre>
            </div>

            {/* Recent Auth Events */}
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Recent Auth Events
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {debugInfo.authEvents.map((event, index) => (
                  <div key={index} className="text-xs border-b pb-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{event.event}</span>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.details && (
                      <pre className="text-xs bg-gray-50 p-1 rounded mt-1">
                        {formatJson(event.details)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={gatherDebugInfo}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                console.log('Full Debug Info:', debugInfo);
                alert('Debug info logged to console');
              }}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Log to Console
            </button>
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  console.error('Sign out error:', error);
                  alert('Error signing out: ' + error.message);
                } else {
                  alert('Signed out successfully');
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Force Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};