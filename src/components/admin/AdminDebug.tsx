import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminDebug() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Authentication Status:</h3>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
          
          {user && (
            <>
              <div>
                <h3 className="font-semibold">User Email:</h3>
                <p>{user.email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">User ID:</h3>
                <p>{user.id}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Profile Data:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(user.profile, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Profile Role:</h3>
                <p className="text-lg font-bold text-blue-600">
                  {user.profile?.role || 'No role found'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Is Admin?</h3>
                <p className={`text-lg font-bold ${user.profile?.role === 'admin' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.profile?.role === 'admin' ? 'YES' : 'NO'}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}