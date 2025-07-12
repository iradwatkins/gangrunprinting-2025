import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, Navigate } from "react-router-dom";
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
  Zap,
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  Server,
  Eye,
  SendHorizontal,
  LayoutTemplate,
  UserCheck,
  Bot,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@/components/auth/UserButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getShortBuildTime, buildInfo } from "@/utils/buildInfo";
import { useSession } from "@/hooks/useSession";

const navigation = [
  // Main Dashboard
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    exact: true,
  },

  // Operations
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },

  // Analytics with sub-menu
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    children: [
      {
        name: "Orders",
        href: "/admin/analytics/orders",
        icon: ShoppingCart,
      },
      {
        name: "Customers",
        href: "/admin/analytics/customers",
        icon: Users,
      },
      {
        name: "Revenue",
        href: "/admin/analytics/revenue",
        icon: TrendingUp,
      },
      {
        name: "Products",
        href: "/admin/analytics/products",
        icon: Package,
      },
      {
        name: "System",
        href: "/admin/analytics/system",
        icon: Server,
      },
    ],
  },

  // Core Product Management
  {
    name: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Quantities",
    href: "/admin/quantities",
    icon: Hash,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },

  // Global Options
  {
    name: "Paper Stocks",
    href: "/admin/paper-stocks",
    icon: Palette,
  },
  {
    name: "Print Sizes",
    href: "/admin/print-sizes",
    icon: Ruler,
  },
  {
    name: "Turnaround Times",
    href: "/admin/turnaround-times",
    icon: Clock,
  },
  {
    name: "Add-on Services",
    href: "/admin/add-ons",
    icon: Plus,
  },

  // Vendors
  {
    name: "Vendors",
    href: "/admin/vendors",
    icon: Truck,
  },

  // Email Marketing with sub-menu
  {
    name: "Email Marketing",
    href: "/admin/email",
    icon: Mail,
    children: [
      {
        name: "Overview",
        href: "/admin/email/overview",
        icon: Eye,
      },
      {
        name: "Campaigns",
        href: "/admin/email/campaigns",
        icon: SendHorizontal,
      },
      {
        name: "Templates",
        href: "/admin/email/templates",
        icon: LayoutTemplate,
      },
      {
        name: "Segments",
        href: "/admin/email/segments",
        icon: UserCheck,
      },
      {
        name: "Automations",
        href: "/admin/email/automations",
        icon: Bot,
      },
    ],
  },

  // System
  {
    name: "Checkout Settings",
    href: "/admin/checkout-settings",
    icon: Settings,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Broker Applications",
    href: "/admin/broker-applications",
    icon: UserCheck,
  },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  // Get session data from the useSession hook
  const { user, profile, isLoading, isInitialized } = useSession();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  // CRITICAL: Show loading state while session is being initialized
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  // Check if user has admin access after loading is complete
  const isAdmin =
    user &&
    profile &&
    (profile.role === "admin" || profile.role === "super_admin");

  // Redirect non-admin users to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render admin layout for authenticated admins
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <nav className="h-full bg-white dark:bg-gray-800 border-r">
            <div className="p-4">
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile?.full_name || profile?.email || "Admin"}
              </p>
            </div>
            <Separator />
            <div className="px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => !item.children && setSidebarOpen(false)}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href, item.exact)
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {item.children && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleExpanded(item.name);
                        }}
                        className="ml-auto"
                      >
                        {expandedItems.includes(item.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </Link>
                  {item.children && expandedItems.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                            isActive(child.href)
                              ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <child.icon className="mr-2 h-4 w-4" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Build: {getShortBuildTime()}
                {buildInfo.isDevelopment && (
                  <Badge variant="secondary" className="ml-2">
                    Dev
                  </Badge>
                )}
              </div>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <nav className="flex-1 bg-white dark:bg-gray-800 border-r">
          <div className="p-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {profile?.full_name || profile?.email || "Admin"}
            </p>
          </div>
          <Separator />
          <div className="px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href, item.exact)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.children && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpanded(item.name);
                      }}
                      className="ml-auto"
                    >
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </Link>
                {item.children && expandedItems.includes(item.name) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                          isActive(child.href)
                            ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <child.icon className="mr-2 h-4 w-4" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Build: {getShortBuildTime()}
              {buildInfo.isDevelopment && (
                <Badge variant="secondary" className="ml-2">
                  Dev
                </Badge>
              )}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {navigation.find((item) => isActive(item.href, item.exact))
                    ?.name || "Admin"}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 md:px-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
