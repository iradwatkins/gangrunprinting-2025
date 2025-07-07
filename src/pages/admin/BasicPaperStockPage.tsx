import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi } from '@/api/global-options';
import { initializePaperStocksTable, createBasicPaperStocks } from '@/utils/init-database';

export function BasicPaperStockPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('300');
  const [price, setPrice] = useState('0.008');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Paper stock name is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await paperStocksApi.createPaperStock({
        name: name.trim(),
        weight: parseInt(weight),
        price_per_sq_inch: parseFloat(price),
        description: description.trim() || null,
        is_active: isActive
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: `Paper stock "${name}" created successfully`,
      });

      // Reset form
      setName('');
      setWeight('300');
      setPrice('0.008');
      setDescription('');
      setIsActive(true);
      
    } catch (error) {
      console.error('Error creating paper stock:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create paper stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    setTestLoading(true);
    try {
      const initResult = await initializePaperStocksTable();
      if (!initResult.success) {
        toast({
          title: "Database Test Failed",
          description: initResult.error || "Could not connect to paper_stocks table",
          variant: "destructive",
        });
        return;
      }

      const createResult = await createBasicPaperStocks();
      const successful = createResult.filter(r => r.success).length;
      
      toast({
        title: "Database Test Successful",
        description: `Paper stocks table is working. ${successful}/${createResult.length} basic stocks ready.`,
      });
    } catch (error) {
      toast({
        title: "Database Test Error",
        description: error instanceof Error ? error.message : "Unknown database error",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Paper Stock</h1>
            <p className="text-muted-foreground">
              Add a new paper stock option for products
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={testDatabase} disabled={testLoading}>
              {testLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Database
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/paper-stocks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Paper Stocks
              </a>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paper Stock Details</CardTitle>
            <CardDescription>
              Fill in the basic information for the new paper stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Paper Stock Name *</label>
                  <Input
                    id="name"
                    placeholder="e.g., 14pt Card Stock"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="weight" className="text-sm font-medium">Weight (GSM) *</label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="50"
                    max="500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price per Square Inch *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.0001"
                    className="pl-7"
                    placeholder="0.0080"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0.0001"
                    max="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Premium thick card stock perfect for professional printing"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Active</label>
                  <p className="text-sm text-muted-foreground">
                    Make this paper stock available to customers
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" asChild>
                  <a href="/admin/paper-stocks">Cancel</a>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Paper Stock
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}