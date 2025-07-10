import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Search, Users, Shield, Mail, Building, Phone, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  is_admin?: boolean;
  role?: 'admin' | 'customer' | 'broker';
  is_broker?: boolean;
  company_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  useEffect(() => {
    checkCurrentUserAdmin();
    fetchUsers();
  }, []);

  async function checkCurrentUserAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Special check for iradwatkins@gmail.com
      if (user.email === 'iradwatkins@gmail.com') {
        setCurrentUserIsAdmin(true);
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Check both is_admin and role fields for compatibility
      const isAdmin = profile?.is_admin || profile?.role === 'admin' || false;
      setCurrentUserIsAdmin(isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      
      // First get all user profiles
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Then get emails from auth.users for those who don't have email in profile
      const profilesWithEmail = await Promise.all((profiles || []).map(async (profile) => {
        if (!profile.email && profile.user_id) {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id).catch(() => ({ data: { user: null } }));
          return { ...profile, email: user?.email || null };
        }
        return profile;
      }));

      setUsers(profilesWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdmin(userId: string, currentIsAdmin: boolean) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_admin: !currentIsAdmin,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${!currentIsAdmin ? 'granted' : 'revoked'} admin access`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive'
      });
    }
  }

  async function toggleBroker(userId: string, currentIsBroker: boolean) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_broker: !currentIsBroker,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `User ${!currentIsBroker ? 'granted' : 'revoked'} broker access`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating broker status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update broker status',
        variant: 'destructive'
      });
    }
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  if (!currentUserIsAdmin) {
    return (
      <AdminLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Only admins can manage users.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage admin and broker access for users</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            {users.length} Total Users
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Search by email, company name, or phone number</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{user.email || 'No email'}</span>
                        {user.email === 'iradwatkins@gmail.com' && (
                          <Badge variant="secondary">Primary Admin</Badge>
                        )}
                      </div>
                      
                      {user.company_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-3 w-3" />
                          {user.company_name}
                        </div>
                      )}
                      
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        {user.is_admin && (
                          <Badge variant="default">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                        {user.is_broker && (
                          <Badge variant="outline">Broker</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`admin-${user.id}`}
                          checked={user.is_admin}
                          onCheckedChange={() => toggleAdmin(user.user_id, user.is_admin)}
                          disabled={user.email === 'iradwatkins@gmail.com'}
                        />
                        <Label htmlFor={`admin-${user.id}`}>Admin</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`broker-${user.id}`}
                          checked={user.is_broker}
                          onCheckedChange={() => toggleBroker(user.user_id, user.is_broker)}
                        />
                        <Label htmlFor={`broker-${user.id}`}>Broker</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No users found matching your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}