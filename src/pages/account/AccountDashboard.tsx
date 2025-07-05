import { Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  CreditCard, 
  MapPin, 
  Settings, 
  ShoppingCart,
  TrendingUp,
  Clock,
  Shield,
  Bell,
  Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCart } from '@/hooks/useCart';

export function AccountDashboard() {
  const { user } = useAuth();
  const { addresses, brokerApplication } = useProfile();
  
  const isBroker = user?.profile?.is_broker || false;
  const { cart } = useCart();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const name = user?.profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
    return `${greeting}, ${name}!`;
  };

  const quickActions = [
    {
      icon: Package,
      title: 'Browse Products',
      description: 'Explore our printing services',
      href: '/products',
      color: 'text-blue-600'
    },
    {
      icon: ShoppingCart,
      title: 'View Cart',
      description: `${cart.total_items} items in cart`,
      href: '/cart',
      color: 'text-green-600'
    },
    {
      icon: Settings,
      title: 'Profile Settings',
      description: 'Update your information',
      href: '/account/profile',
      color: 'text-purple-600'
    },
    {
      icon: MapPin,
      title: 'Manage Addresses',
      description: `${addresses.length} saved addresses`,
      href: '/account/addresses',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
              <p className="text-muted-foreground">
                Welcome to your account dashboard
              </p>
            </div>
            {isBroker && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Broker Account
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Link to={action.href} className="block">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-md bg-muted ${action.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{action.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {action.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Account Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Completion
                  </CardTitle>
                  <CardDescription>
                    Complete your profile for a better experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Profile Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="w-full" />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Basic Information</span>
                        <Badge variant="secondary" className="text-green-600">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Profile Picture</span>
                        <Badge variant="outline">Optional</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Shipping Address</span>
                        <Badge variant={addresses.length > 0 ? "secondary" : "outline"} 
                               className={addresses.length > 0 ? "text-green-600" : ""}>
                          {addresses.length > 0 ? 'Complete' : 'Missing'}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/account/profile">
                        Complete Profile
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your recent account activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Account created</span>
                      <span className="text-muted-foreground ml-auto">Today</span>
                    </div>
                    {cart.total_items > 0 && (
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Added items to cart</span>
                        <span className="text-muted-foreground ml-auto">Today</span>
                      </div>
                    )}
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      More activity will appear here as you use our services
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Broker Application Status */}
            {brokerApplication && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Broker Application Status
                  </CardTitle>
                  <CardDescription>
                    Track your broker application progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Application #{brokerApplication.id.slice(0, 8)}</div>
                      <div className="text-sm text-muted-foreground">
                        Submitted for {brokerApplication.company_name}
                      </div>
                    </div>
                    <Badge 
                      variant={brokerApplication.status === 'approved' ? 'secondary' : 
                               brokerApplication.status === 'rejected' ? 'destructive' : 'outline'}
                      className={brokerApplication.status === 'approved' ? 'text-green-600' : ''}
                    >
                      {brokerApplication.status.charAt(0).toUpperCase() + brokerApplication.status.slice(1)}
                    </Badge>
                  </div>
                  {brokerApplication.status === 'pending' && (
                    <div className="mt-4 text-sm text-muted-foreground">
                      Your application is being reviewed. We'll notify you once it's processed.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Account Menu</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {[
                    { icon: User, label: 'Profile', href: '/account/profile' },
                    { icon: Package, label: 'Orders', href: '/account/orders' },
                    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
                    { icon: CreditCard, label: 'Payment', href: '/account/payment' },
                    { icon: Bell, label: 'Notifications', href: '/account/notifications' },
                    { icon: Settings, label: 'Settings', href: '/account/settings' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  
                  {!isBroker && (
                    <>
                      <Separator />
                      <Link
                        to="/account/broker-application"
                        className="flex items-center space-x-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Apply for Broker</span>
                        <Badge variant="outline" className="ml-auto text-xs">Special</Badge>
                      </Link>
                    </>
                  )}
                </nav>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Orders</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cart Items</span>
                  <span className="font-medium">{cart.total_items}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Saved Addresses</span>
                  <span className="font-medium">{addresses.length}</span>
                </div>
                {isBroker && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Broker Status</span>
                    <Badge variant="secondary" className="text-green-600">Active</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  View FAQs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}