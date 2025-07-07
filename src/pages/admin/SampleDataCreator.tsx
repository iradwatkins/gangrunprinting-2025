import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, PlayCircle, Package } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { createSampleProduct } from '@/utils/create-sample-data';

export function SampleDataCreator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting sample product creation...');
      const createdData = await createSampleProduct();
      
      setResult(createdData);
      toast({
        title: "Success!",
        description: "Club Flyers sample product created successfully",
      });
      
      console.log('✅ Sample product creation completed:', createdData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('❌ Sample product creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sample Data Creator</h1>
            <p className="text-muted-foreground">Create a complete sample product with all global options</p>
          </div>
          <Button 
            onClick={handleCreateSampleData} 
            disabled={isLoading}
            className="flex items-center gap-2"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Create Club Flyers Product
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Sample Product: Club Flyers
            </CardTitle>
            <CardDescription>
              This will create a complete "Club Flyers" product following the documentation requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">What will be created:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Flyers & Postcards category</li>
                    <li>• Premium Print Solutions vendor</li>
                    <li>• 2 paper stock options (14pt, 100lb)</li>
                    <li>• 2 coating options (UV, None)</li>
                    <li>• 3 print sizes (4×6, 5×7, 8.5×11)</li>
                    <li>• 2 turnaround times (Standard, Rush)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Additional features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• 2 add-on services (Digital Proof, Exact Size)</li>
                    <li>• Standard quantity options</li>
                    <li>• Single/double-sided printing</li>
                    <li>• Complete product relationships</li>
                    <li>• Ready for customer orders</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                Creation Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 text-sm">{error}</p>
              <div className="mt-4">
                <p className="text-sm text-red-600">
                  <strong>Possible solutions:</strong>
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1">
                  <li>• Make sure you're logged in as an admin user</li>
                  <li>• Check that all database tables exist (run migration if needed)</li>
                  <li>• Verify database permissions are correct</li>
                  <li>• Check the browser console for detailed error messages</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Sample Product Created Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-700">Product Details:</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{result.product?.name}</Badge>
                        <span className="text-sm text-green-600">({result.product?.slug})</span>
                      </div>
                      <p className="text-sm text-green-600">Category: {result.category?.name}</p>
                      <p className="text-sm text-green-600">Vendor: {result.vendor?.name}</p>
                      <p className="text-sm text-green-600">Base Price: ${result.product?.base_price}/sq in</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-700">Options Created:</h4>
                    <div className="mt-2 space-y-1 text-sm text-green-600">
                      <p>📄 {result.paperStocks?.length || 0} Paper Stocks</p>
                      <p>✨ {result.coatings?.length || 0} Coatings</p>
                      <p>📏 {result.printSizes?.length || 0} Print Sizes</p>
                      <p>⏰ {result.turnaroundTimes?.length || 0} Turnaround Times</p>
                      <p>🔧 {result.addOns?.length || 0} Add-on Services</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-green-700 mb-2">Next Steps:</h4>
                  <div className="space-y-2 text-sm text-green-600">
                    <p>1. ✅ Go to <strong>Products</strong> to see your new "Club Flyers" product</p>
                    <p>2. ✅ Test the enhanced product form by editing the product</p>
                    <p>3. ✅ Visit the product page to see customer configuration options</p>
                    <p>4. ✅ Create additional products using the same global options</p>
                    <p>5. ✅ Test placing a complete order through the system</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm">
                    <a href="/admin/products">View Products</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/admin/products/new">Create Another Product</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About This Sample Product</CardTitle>
            <CardDescription>
              Technical details about the Club Flyers product implementation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Pricing Formula Implementation:</h4>
                <p className="text-muted-foreground">
                  The product follows the exact pricing formula from the documentation:
                  <br />
                  <code className="bg-muted px-1 rounded text-xs">
                    Base_Paper_Print_Price = Quantity × Area × PaperPrice × SidesFactor
                  </code>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Global Options Integration:</h4>
                <p className="text-muted-foreground">
                  All global options are properly linked through junction tables, allowing:
                </p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Dynamic pricing based on paper stock selection</li>
                  <li>• Size-specific pricing calculations</li>
                  <li>• Turnaround time markup application</li>
                  <li>• Add-on service pricing integration</li>
                  <li>• Single/double-sided multiplier application</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Database Relationships:</h4>
                <p className="text-muted-foreground">
                  The product uses normalized database relationships ensuring flexibility and scalability:
                </p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• product_paper_stocks (many-to-many with default flags)</li>
                  <li>• product_print_sizes (many-to-many with price modifiers)</li>
                  <li>• product_turnaround_times (many-to-many with overrides)</li>
                  <li>• product_add_ons (many-to-many with mandatory flags)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}