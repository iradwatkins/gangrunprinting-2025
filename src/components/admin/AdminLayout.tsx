import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  Truck, 
  Palette, 
  Ruler, 
  Clock, 
  Plus,
  Hash,
  Copy,
  Menu,
  X,
  Home,
  Settings,
  BarChart3,
  ShoppingCart,
  Mail,
  FileText,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserButton } from '@/components/auth/UserButton';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navigation = [
  // Main Dashboard
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    exact: true
  },
  
  // Operations
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart
  },
  
  // Analytics
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3
  },
  
  // Core Product Management
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: Tags
  },
  {
    name: 'Quantities',
    href: '/admin/quantities',
    icon: Hash
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package
  },
  
  // Global Options
  {
    name: 'Paper Stocks',
    href: '/admin/paper-stocks',
    icon: Palette
  },
  {
    name: 'Print Sizes',
    href: '/admin/print-sizes',
    icon: Ruler
  },
  {
    name: 'Turnaround Times',
    href: '/admin/turnaround-times',
    icon: Clock
  },
  {
    name: 'Add-on Services',
    href: '/admin/add-ons',
    icon: Plus
  },
  
  // Vendors
  {
    name: 'Vendors',
    href: '/admin/vendors',
    icon: Truck
  },
  
  // Marketing
  {
    name: 'Email Marketing',
    href: '/admin/email',
    icon: Mail
  },
  
  // System
  {
    name: 'Settings',
    href: '/admin/checkout-settings',
    icon: Settings
  },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center">
                <Icon className={`mr-3 h-4 w-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b bg-card px-6 py-4 lg:px-6 pl-16 lg:pl-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Business Management</h2>
              <Badge variant="secondary" className="text-xs">
                Admin Panel
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/" target="_blank" rel="noopener noreferrer">
                  View Store
                </a>
              </Button>
              <Button size="sm" asChild>
                <a href="/admin/products/new">
                  Add Product
                </a>
              </Button>
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}