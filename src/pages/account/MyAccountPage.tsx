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
  ArrowRight,
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  ChevronRight,
  Plus,
  Eye,
  Download,
  Calendar,
  Target,
  Zap,
  Award,
  Heart,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCart } from '@/hooks/useCart';

export function MyAccountPage() {
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
      icon: Plus,
      title: 'Create Order',
      description: 'Start a new printing order',
      href: '/products',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900',
      primary: true
    },
    {
      icon: Package,
      title: 'View Orders',
      description: 'Track your order history',
      href: '/my-account/orders',
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900'
    },
    {
      icon: FileText,
      title: 'Upload Files',
      description: 'Manage your artwork',
      href: '/upload-artwork',
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900'
    },
    {
      icon: User,
      title: 'Account Settings',
      description: 'Update profile & preferences',
      href: '/my-account/profile',
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900'
    }
  ];

  const stats = [
    {
      title: 'Total Orders',
      value: '0',
      change: '+0%',
      changeType: 'neutral' as const,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Orders This Month',
      value: '0',
      change: '+0%',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Cart Items',
      value: cart.total_items.toString(),
      change: cart.total_items > 0 ? '+' + cart.total_items : '0',
      changeType: cart.total_items > 0 ? 'positive' : 'neutral' as const,
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      title: 'Total Spent',
      value: '$0',
      change: '+$0',
      changeType: 'neutral' as const,
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      type: 'account_created',
      title: 'Account Created',
      description: 'Welcome to GangRun Printing!',
      time: 'Today',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    ...(cart.total_items > 0 ? [{
      type: 'cart_updated',
      title: 'Cart Updated',
      description: `${cart.total_items} items added to cart`,
      time: 'Today',
      icon: ShoppingCart,
      color: 'text-blue-600'
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Shopify-style Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getWelcomeMessage()}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isBroker && (
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Broker Account
                </Badge>
              )}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/products">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Order
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.href} className="group">
                  <Card className={`h-full transition-all duration-200 hover:shadow-md border-2 ${action.color} ${action.primary ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-white dark:bg-gray-800 group-hover:scale-105 transition-transform">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-current">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {action.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-current transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity & Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                      </div>
                    );
                  })}
                  {recentActivity.length === 1 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">More activity will appear here as you use our services</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Setup
                </CardTitle>
                <CardDescription>
                  Complete your profile to get the most out of your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Profile completion</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Basic Information</span>
                      </div>
                      <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                        Complete
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Shipping Address</span>
                      </div>
                      <Badge variant={addresses.length > 0 ? "secondary" : "outline"} 
                             className={addresses.length > 0 ? "text-green-600 bg-green-100 dark:bg-green-900" : "text-orange-600 bg-orange-100 dark:bg-orange-900"}>
                        {addresses.length > 0 ? 'Complete' : 'Needed'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Profile Picture</span>
                      </div>
                      <Badge variant="outline" className="text-gray-500">
                        Optional
                      </Badge>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4">
                    <Link to="/my-account/profile">
                      Complete Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Broker Application Status */}
            {brokerApplication && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Broker Application
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Application #{brokerApplication.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {brokerApplication.company_name}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={brokerApplication.status === 'approved' ? 'secondary' : 
                               brokerApplication.status === 'rejected' ? 'destructive' : 'outline'}
                      className={brokerApplication.status === 'approved' ? 'text-green-600 bg-green-100 dark:bg-green-900' : ''}
                    >
                      {brokerApplication.status.charAt(0).toUpperCase() + brokerApplication.status.slice(1)}
                    </Badge>
                  </div>
                  {brokerApplication.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your application is under review. We'll notify you once it's processed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Navigation & Support */}
          <div className="space-y-6">
            {/* Account Navigation */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {[
                    { icon: User, label: 'Profile Settings', href: '/my-account/profile' },
                    { icon: Package, label: 'Order History', href: '/my-account/orders' },
                    { icon: FileText, label: 'Upload Files', href: '/upload-artwork' },
                    { icon: MapPin, label: 'Addresses', href: '/my-account/addresses' },
                    { icon: CreditCard, label: 'Payment Methods', href: '/my-account/payment' },
                    { icon: Bell, label: 'Notifications', href: '/my-account/notifications' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                      </Link>
                    );
                  })}
                  
                  {!isBroker && (
                    <>
                      <Separator className="my-2" />
                      <Link
                        to="/my-account/broker-application"
                        className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            Become a Broker
                          </span>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900 dark:border-blue-800">
                          Special
                        </Badge>
                      </Link>
                    </>
                  )}
                </nav>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Star className="h-4 w-4 mr-3" />
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Bell className="h-4 w-4 mr-3" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileText className="h-4 w-4 mr-3" />
                  Documentation
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active Orders</span>
                  <span className="font-semibold text-gray-900 dark:text-white">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Cart Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{cart.total_items}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Saved Addresses</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{addresses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Member Since</span>
                  <span className="font-semibold text-gray-900 dark:text-white">Today</span>
                </div>
                {isBroker && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Broker Status</span>
                    <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                      Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}