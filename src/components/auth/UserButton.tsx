
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
import { useAdminMode } from '@/contexts/AdminModeContext';
import { User, LogOut, Settings, Shield, LayoutDashboard, ToggleLeft, ToggleRight } from 'lucide-react';

export function UserButton() {
  const { user, signOut } = useAuth();
  const { isAdminMode, toggleAdminMode, canUseAdminMode } = useAdminMode();

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
                <Badge variant={isAdminMode ? "destructive" : "secondary"} className="text-xs">
                  {isAdminMode ? 'Admin' : 'Customer'}
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
          <Link to="/account">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {isAdminMode ? 'Admin Dashboard' : 'Dashboard'}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        {canUseAdminMode && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleAdminMode}>
              {isAdminMode ? (
                <ToggleRight className="mr-2 h-4 w-4 text-red-600" />
              ) : (
                <ToggleLeft className="mr-2 h-4 w-4 text-gray-400" />
              )}
              {isAdminMode ? 'Switch to Customer Mode' : 'Switch to Admin Mode'}
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
