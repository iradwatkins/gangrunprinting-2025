import { useState } from 'react';
import { Plus, Save, Loader2, Palette, Copy, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { coatingsApi, sidesApi } from '@/api/global-options';

export function QuickGlobalOptionsPage() {
  const { toast } = useToast();
  const [loadingCoating, setLoadingCoating] = useState(false);
  const [loadingSides, setLoadingSides] = useState(false);

  // Coating Form State
  const [coatingName, setCoatingName] = useState('');
  const [coatingDescription, setCoatingDescription] = useState('');
  const [coatingPriceModifier, setCoatingPriceModifier] = useState('0.0000');
  const [coatingActive, setCoatingActive] = useState(true);

  // Sides Form State
  const [sidesName, setSidesName] = useState('');
  const [sidesDescription, setSidesDescription] = useState('');
  const [sidesPriceModifier, setSidesPriceModifier] = useState('0.0000');
  const [sidesActive, setSidesActive] = useState(true);

  const handleCreateCoating = async () => {
    if (!coatingName.trim()) {
      toast({
        title: "Error",
        description: "Coating name is required",
        variant: "destructive",
      });
      return;
    }

    setLoadingCoating(true);
    try {
      const response = await coatingsApi.createCoating({
        name: coatingName,
        description: coatingDescription || null,
        price_modifier: parseFloat(coatingPriceModifier),
        is_active: coatingActive
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Coating "${coatingName}" created successfully`,
      });

      // Reset form
      setCoatingName('');
      setCoatingDescription('');
      setCoatingPriceModifier('0.0000');
      setCoatingActive(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create coating",
        variant: "destructive",
      });
    } finally {
      setLoadingCoating(false);
    }
  };

  const handleCreateSides = async () => {
    if (!sidesName.trim()) {
      toast({
        title: "Error",
        description: "Print sides name is required",
        variant: "destructive",
      });
      return;
    }

    setLoadingSides(true);
    try {
      const response = await sidesApi.createSides({
        name: sidesName,
        description: sidesDescription || null,
        price_modifier: parseFloat(sidesPriceModifier),
        is_active: sidesActive
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Print sides "${sidesName}" created successfully`,
      });

      // Reset form
      setSidesName('');
      setSidesDescription('');
      setSidesPriceModifier('0.0000');
      setSidesActive(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create print sides",
        variant: "destructive",
      });
    } finally {
      setLoadingSides(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quick Global Options Setup</h1>
          <p className="text-muted-foreground">
            Quickly create basic global options for your printing products
          </p>
        </div>

        <Tabs defaultValue="coatings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coatings">Coatings</TabsTrigger>
            <TabsTrigger value="sides">Print Sides</TabsTrigger>
          </TabsList>

          <TabsContent value="coatings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Create New Coating
                </CardTitle>
                <CardDescription>
                  Add coating options like UV, matte, or no coating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="coating-name" className="text-sm font-medium">
                      Coating Name
                    </label>
                    <Input
                      id="coating-name"
                      placeholder="e.g., High Gloss UV"
                      value={coatingName}
                      onChange={(e) => setCoatingName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="coating-price" className="text-sm font-medium">
                      Price Modifier
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="coating-price"
                        type="number"
                        step="0.0001"
                        className="pl-7"
                        placeholder="0.0000"
                        value={coatingPriceModifier}
                        onChange={(e) => setCoatingPriceModifier(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="coating-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="coating-description"
                    placeholder="Premium high-gloss UV coating for vibrant colors"
                    value={coatingDescription}
                    onChange={(e) => setCoatingDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Active</label>
                    <p className="text-sm text-muted-foreground">
                      Make this coating available to customers
                    </p>
                  </div>
                  <Switch
                    checked={coatingActive}
                    onCheckedChange={setCoatingActive}
                  />
                </div>

                <Button onClick={handleCreateCoating} disabled={loadingCoating}>
                  {loadingCoating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Coating
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Create Print Sides Option
                </CardTitle>
                <CardDescription>
                  Add print sides options like single-sided or double-sided
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="sides-name" className="text-sm font-medium">
                      Print Sides Name
                    </label>
                    <Input
                      id="sides-name"
                      placeholder="e.g., Single Sided"
                      value={sidesName}
                      onChange={(e) => setSidesName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sides-price" className="text-sm font-medium">
                      Price Modifier
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="sides-price"
                        type="number"
                        step="0.0001"
                        className="pl-7"
                        placeholder="0.0000"
                        value={sidesPriceModifier}
                        onChange={(e) => setSidesPriceModifier(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="sides-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="sides-description"
                    placeholder="Single-sided printing on front of paper"
                    value={sidesDescription}
                    onChange={(e) => setSidesDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Active</label>
                    <p className="text-sm text-muted-foreground">
                      Make this print sides option available to customers
                    </p>
                  </div>
                  <Switch
                    checked={sidesActive}
                    onCheckedChange={setSidesActive}
                  />
                </div>

                <Button onClick={handleCreateSides} disabled={loadingSides}>
                  {loadingSides && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Print Sides
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Quick Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Suggested Coatings</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• No Coating (Base option)</li>
                    <li>• High Gloss UV</li>
                    <li>• Matte Finish</li>
                    <li>• Satin Finish</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Suggested Print Sides</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Single Sided (Front Only)</li>
                    <li>• Double Sided (Front & Back)</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Next Step:</strong> After creating coatings and print sides, visit{' '}
                  <a href="/admin/paper-stocks/new" className="text-blue-600 hover:underline">
                    Create Paper Stock
                  </a>{' '}
                  to create your first paper stock with these options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}