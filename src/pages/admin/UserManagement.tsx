import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, UserCog, Mail, Building, Phone, Calendar, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin' | 'broker';
  is_broker: boolean;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  notes: string | null;
}

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNotes, setNewAdminNotes] = useState('');
  const queryClient = useQueryClient();

  // Fetch all user profiles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  // Fetch admin users
  const { data: adminUsers = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['admin', 'admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminUser[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  // Update user role
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role,
          is_broker: role === 'broker'
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User role updated successfully');
      setShowEditDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    }
  });

  // Add admin user
  const addAdminMutation = useMutation({
    mutationFn: async ({ email, notes }: { email: string; notes: string }) => {
      const { error } = await supabase
        .from('admin_users')
        .insert({ email, notes });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Admin user added successfully');
      setShowAdminDialog(false);
      setNewAdminEmail('');
      setNewAdminNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add admin user');
    }
  });

  // Remove admin user
  const removeAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admin_users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Admin access revoked');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove admin user');
    }
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'broker': return 'secondary';
      default: return 'default';
    }
  };

  const handleRoleUpdate = () => {
    if (selectedUser) {
      updateUserMutation.mutate({
        userId: selectedUser.id,
        role: selectedUser.role
      });
    }
  };

  const handleAddAdmin = () => {
    if (newAdminEmail && newAdminEmail.includes('@')) {
      addAdminMutation.mutate({
        email: newAdminEmail,
        notes: newAdminNotes || null
      });
    } else {
      toast.error('Please enter a valid email address');
    }
  };

  if (usersLoading || adminsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCog className="h-8 w-8" />
          User Management
        </h1>
        <Button onClick={() => setShowAdminDialog(true)}>
          <Shield className="mr-2 h-4 w-4" />
          Manage Admins
        </Button>
      </div>

      {/* User Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Total users: {users.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.company ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {user.company}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {user.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {user.phone}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditDialog(true);
                      }}
                    >
                      Edit Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <Select
                value={selectedUser?.role}
                onValueChange={(value) => setSelectedUser(prev => prev ? {...prev, role: value as any} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedUser?.role === 'admin' && (
              <p className="text-sm text-amber-600">
                Note: To grant admin access, you must also add this email to the admin_users table.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Management Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Admin Users</DialogTitle>
            <DialogDescription>
              Control who has admin access to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Admin Form */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="font-semibold">Add New Admin</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email Address</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Notes (optional)</Label>
                  <Input
                    id="admin-notes"
                    type="text"
                    value={newAdminNotes}
                    onChange={(e) => setNewAdminNotes(e.target.value)}
                    placeholder="Reason for admin access"
                  />
                </div>
              </div>
              <Button onClick={handleAddAdmin} disabled={addAdminMutation.isPending}>
                {addAdminMutation.isPending ? 'Adding...' : 'Add Admin'}
              </Button>
            </div>

            {/* Current Admins List */}
            <div className="space-y-2">
              <h3 className="font-semibold">Current Admins</h3>
              {adminUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No admin users configured</p>
              ) : (
                <div className="space-y-2">
                  {adminUsers.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        {admin.notes && (
                          <p className="text-sm text-muted-foreground">{admin.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdminMutation.mutate(admin.email)}
                        disabled={removeAdminMutation.isPending || adminUsers.length === 1}
                      >
                        {removeAdminMutation.isPending ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}