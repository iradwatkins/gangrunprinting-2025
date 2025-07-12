import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Shield, Crown, User, Mail, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'admin';
  company_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const { isSuperAdmin, toggleAdminStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Toggle admin status mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await toggleAdminStatus(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user role');
    },
  });

  const getDisplayName = (user: UserProfile) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email;
  };

  const getRoleBadge = (role: string, email: string) => {
    // Check if super admin
    if (email === 'iradwatkins@gmail.com') {
      return (
        <Badge variant="destructive">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    }
    
    switch (role) {
      case 'admin':
        return (
          <Badge variant="secondary">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <User className="h-3 w-3 mr-1" />
            Customer
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-500">Error loading users: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
                {isSuperAdmin && ' - You have Super Admin access'}
              </CardDescription>
            </div>
            {isSuperAdmin && (
              <Badge variant="destructive">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Joined</TableHead>
                      {isSuperAdmin && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {getDisplayName(user)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role, user.email)}</TableCell>
                        <TableCell>{user.company_name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <Button
                              variant={user.role === 'admin' ? 'destructive' : 'default'}
                              size="sm"
                              onClick={() => toggleAdminMutation.mutate(user.user_id)}
                              disabled={toggleAdminMutation.isPending || user.email === 'iradwatkins@gmail.com'}
                            >
                              {toggleAdminMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : user.role === 'admin' ? (
                                'Remove Admin'
                              ) : (
                                'Make Admin'
                              )}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {users?.length || 0} users
              {isSuperAdmin && (
                <span className="ml-2">
                  • {users?.filter(u => u.role === 'admin').length || 0} admins
                  • {users?.filter(u => u.role === 'customer').length || 0} customers
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}