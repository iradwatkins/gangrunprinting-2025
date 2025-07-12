import { Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin, 
  Shield,
  Bell,
  Star,
  FileText,
  Activity,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export function MyAccountPage() {
  const { user } = useAuth();
  const { addresses, brokerApplication } = useProfile();
  
  const isBroker = user?.profile?.is_broker || false;

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const name = user?.profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
    return `${greeting}, ${name}!`;
  };



  const recentActivity = [
    {
      type: 'account_created',
      title: 'Account Created',
      description: 'Welcome to GangRun Printing!',
      time: 'Today',
      icon: Activity,
      color: 'text-green-600'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Custom Page Header */}
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
                    { icon: Package, label: 'My Orders', href: '/my-account/orders' },
                    { icon: FileText, label: 'Upload Artwork', href: '/my-account/orders?filter=needs-files' },
                    { icon: MapPin, label: 'Shipping Addresses', href: '/my-account/addresses' },
                    { icon: Shield, label: 'Apply for Broker Discount', href: '/my-account/broker-application' }
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
                </nav>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Star className="h-4 w-4 mr-3" />
                  Order Help
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Bell className="h-4 w-4 mr-3" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FileText className="h-4 w-4 mr-3" />
                  Upload Guidelines
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}