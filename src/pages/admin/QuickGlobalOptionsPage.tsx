import { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Loader2, 
  Palette, 
  Copy, 
  Hash, 
  Ruler, 
  Clock, 
  Package,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { 
  coatingsApi, 
  sidesApi, 
  printSizesApi, 
  turnaroundTimesApi, 
  addOnsApi, 
  quantitiesApi 
} from '@/api/global-options';

export function QuickGlobalOptionsPage() {
  const { toast } = useToast();
  
  // Loading states
  const [loading, setLoading] = useState({
    coatings: false,
    sides: false,
    printSizes: false,
    turnaroundTimes: false,
    addOns: false,
    quantities: false
  });

  // Data states
  const [coatings, setCoatings] = useState([]);
  const [sides, setSides] = useState([]);
  const [printSizes, setPrintSizes] = useState([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [quantities, setQuantities] = useState([]);

  // Form states for quick creation
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price_modifier: '0.0000',
    is_active: true
  });

  const [activeTab, setActiveTab] = useState('coatings');

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [
        coatingsData,
        sidesData,
        printSizesData,
        turnaroundTimesData,
        addOnsData,
        quantitiesData
      ] = await Promise.all([
        coatingsApi.getCoatings().catch(() => ({ coatings: [] })),
        sidesApi.getSides().catch(() => ({ sides: [] })),
        printSizesApi.getPrintSizes().catch(() => ({ printSizes: [] })),
        turnaroundTimesApi.getTurnaroundTimes().catch(() => ({ turnaroundTimes: [] })),
        addOnsApi.getAddOns().catch(() => ({ addOns: [] })),
        quantitiesApi.getQuantities().catch(() => ({ quantities: [] }))
      ]);

      setCoatings(coatingsData.coatings || []);
      setSides(sidesData.sides || []);
      setPrintSizes(printSizesData.printSizes || []);
      setTurnaroundTimes(turnaroundTimesData.turnaroundTimes || []);
      setAddOns(addOnsData.addOns || []);
      setQuantities(quantitiesData.quantities || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      description: '',
      price_modifier: '0.0000',
      is_active: true
    });
  };

  const handleCreate = async (type: string) => {
    if (!newItem.name.trim()) {
      toast({
        title: "Error",
        description: `${type.slice(0, -1)} name is required`,
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let response;
      const itemData = {
        name: newItem.name,
        description: newItem.description || null,
        price_modifier: parseFloat(newItem.price_modifier),
        is_active: newItem.is_active
      };

      switch (type) {
        case 'coatings':
          response = await coatingsApi.createCoating(itemData);
          break;
        case 'sides':
          response = await sidesApi.createSides(itemData);
          break;
        case 'printSizes':
          response = await printSizesApi.createPrintSize(itemData);
          break;
        case 'turnaroundTimes':
          response = await turnaroundTimesApi.createTurnaroundTime(itemData);
          break;
        case 'addOns':
          response = await addOnsApi.createAddOn(itemData);
          break;
        case 'quantities':
          response = await quantitiesApi.createQuantity(itemData);
          break;
        default:
          throw new Error('Invalid type');
      }

      if (response?.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `${newItem.name} created successfully`,
      });

      resetForm();
      loadAllData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to create ${type.slice(0, -1)}`,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getTabConfig = () => [
    {
      id: 'coatings',
      label: 'Coatings',
      icon: Palette,
      data: coatings,
      description: 'UV, matte, gloss finishes'
    },
    {
      id: 'sides',
      label: 'Print Sides',
      icon: Copy,
      data: sides,
      description: 'Single/double sided options'
    },
    {
      id: 'printSizes',
      label: 'Print Sizes',
      icon: Ruler,
      data: printSizes,
      description: 'Available paper dimensions'
    },
    {
      id: 'turnaroundTimes',
      label: 'Turnaround Times',
      icon: Clock,
      data: turnaroundTimes,
      description: 'Delivery timeframes'
    },
    {
      id: 'addOns',
      label: 'Add-ons',
      icon: Plus,
      data: addOns,
      description: 'Extra services & options'
    },
    {
      id: 'quantities',
      label: 'Quantities',
      icon: Hash,
      data: quantities,
      description: 'Available order quantities'
    }
  ];

  const renderItemsList = (items: any[], type: string) => (
    <div className="space-y-2">
      <h3 className="font-medium text-sm text-gray-600">Existing {type}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No {type.toLowerCase()} created yet</p>
      ) : (
        <div className="grid gap-2">
          {items.slice(0, 5).map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <span className="font-medium text-sm">{item.name}</span>
                {item.price_modifier > 0 && (
                  <span className="ml-2 text-xs text-green-600">+${item.price_modifier}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Badge variant={item.is_active ? "default" : "secondary"} className="text-xs">
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
          {items.length > 5 && (
            <p className="text-xs text-gray-500">+{items.length - 5} more...</p>
          )}
        </div>
      )}
    </div>
  );

  const tabConfig = getTabConfig();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Global Options Manager</h1>
            <p className="text-gray-600">
              Manage all printing configuration options in one place
            </p>
          </div>
          <Button asChild variant="outline">
            <a href="/admin/paper-stocks/new">
              <Package className="mr-2 h-4 w-4" />
              Create Paper Stock
            </a>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            {tabConfig.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
                <tab.icon className="w-3 h-3 mr-1" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfig.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Creation Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tab.icon className="w-5 h-5" />
                      Create New {tab.label.slice(0, -1)}
                    </CardTitle>
                    <CardDescription>
                      {tab.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        placeholder={`e.g., ${tab.id === 'coatings' ? 'High Gloss UV' : 
                                              tab.id === 'sides' ? 'Single Sided' :
                                              tab.id === 'printSizes' ? '8.5" x 11"' :
                                              tab.id === 'turnaroundTimes' ? '3-5 Business Days' :
                                              tab.id === 'addOns' ? 'Digital Proof' :
                                              '250 pieces'}`}
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        placeholder="Optional description"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Modifier</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.0001"
                          className="pl-7"
                          placeholder="0.0000"
                          value={newItem.price_modifier}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price_modifier: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Active</label>
                        <p className="text-sm text-muted-foreground">
                          Make this option available to customers
                        </p>
                      </div>
                      <Switch
                        checked={newItem.is_active}
                        onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, is_active: checked }))}
                      />
                    </div>

                    <Button 
                      onClick={() => handleCreate(tab.id)} 
                      disabled={loading[tab.id as keyof typeof loading]}
                      className="w-full"
                    >
                      {loading[tab.id as keyof typeof loading] && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      Create {tab.label.slice(0, -1)}
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Items List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Existing {tab.label}</span>
                      <Badge variant="outline">{tab.data.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderItemsList(tab.data, tab.label)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Setup Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Configure Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up all your printing options (coatings, sizes, turnaround times, etc.)
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">2. Create Paper Stocks</h3>
                  <p className="text-sm text-muted-foreground">
                    Combine options into paper stock configurations
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">3. Build Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Create products using your configured options
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href="/admin/paper-stocks">
                    <Package className="mr-2 h-4 w-4" />
                    Manage Paper Stocks
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/admin/products">
                    <Eye className="mr-2 h-4 w-4" />
                    View Products
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}