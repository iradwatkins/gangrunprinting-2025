
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function UserButton() {
  const { user, signOut } = useAuth();
  
  // Check if user can access admin features
  const canUseAdminMode = user?.profile?.role === 'admin';
  
  // Debug logging for admin detection (commented out to prevent render loops)
  // console.log('🔍 UserButton Debug:', {
  //   userEmail: user?.email,
  //   profileRole: user?.profile?.role,
  //   canUseAdminMode,
  //   hasProfile: !!user?.profile
  // });

  if (!user) return null;

  const initials = user.email
    ?.split('@')[0]
    .split('.')
    .map(name => name[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <div className="flex items-center gap-2">
              <p className="font-medium">{user.email}</p>
              {canUseAdminMode && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            {user.profile?.is_broker && (
              <p className="text-xs text-muted-foreground">Broker Account</p>
            )}
          </div>
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/my-account">
            <User className="mr-2 h-4 w-4" />
            My Account
          </Link>
        </DropdownMenuItem>
        {canUseAdminMode && (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/my-account/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
