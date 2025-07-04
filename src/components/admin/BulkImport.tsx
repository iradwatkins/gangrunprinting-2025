import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/api/products';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ImportPreview {
  valid: any[];
  invalid: { row: number; data: any; errors: string[] }[];
}

export function BulkImport() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const csvTemplate = `name,slug,description,category_id,vendor_id,base_price,minimum_quantity,is_active
"Standard Business Cards","standard-business-cards","Professional business cards","category-uuid","vendor-uuid",25.00,250,true
"Premium Flyers","premium-flyers","High-quality marketing flyers","category-uuid","vendor-uuid",45.00,100,true`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a CSV file',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({
        title: 'Invalid file',
        description: 'CSV file must have a header row and at least one data row',
        variant: 'destructive'
      });
      return;
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const requiredHeaders = ['name', 'slug', 'category_id', 'vendor_id', 'base_price', 'minimum_quantity'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      toast({
        title: 'Invalid CSV format',
        description: `Missing required columns: ${missingHeaders.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }

    const valid: any[] = [];
    const invalid: { row: number; data: any; errors: string[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });

      const errors: string[] = [];
      
      // Basic validation
      if (!rowData.name) errors.push('Name is required');
      if (!rowData.slug) errors.push('Slug is required');
      if (!rowData.category_id) errors.push('Category ID is required');
      if (!rowData.vendor_id) errors.push('Vendor ID is required');
      if (!rowData.base_price || isNaN(parseFloat(rowData.base_price))) {
        errors.push('Valid base price is required');
      }
      if (!rowData.minimum_quantity || isNaN(parseInt(rowData.minimum_quantity))) {
        errors.push('Valid minimum quantity is required');
      }

      // Convert types
      if (rowData.base_price) rowData.base_price = parseFloat(rowData.base_price);
      if (rowData.minimum_quantity) rowData.minimum_quantity = parseInt(rowData.minimum_quantity);
      if (rowData.is_active !== undefined) {
        rowData.is_active = rowData.is_active.toLowerCase() === 'true';
      } else {
        rowData.is_active = true;
      }

      if (errors.length > 0) {
        invalid.push({ row: i + 1, data: rowData, errors });
      } else {
        valid.push(rowData);
      }
    }

    setPreview({ valid, invalid });
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    setProgress(0);
    
    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < preview.valid.length; i++) {
      const product = preview.valid[i];
      
      try {
        const response = await productsApi.createProduct(product);
        
        if (response.error) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: ${response.error}`);
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: Unexpected error`);
      }

      setProgress(((i + 1) / preview.valid.length) * 100);
    }

    setResult(results);
    setImporting(false);
    
    toast({
      title: 'Import completed',
      description: `${results.success} products imported successfully, ${results.failed} failed`
    });
  };

  const resetImport = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Products</DialogTitle>
          <DialogDescription>
            Import multiple products from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Download Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Download Template</CardTitle>
              <CardDescription>
                Download the CSV template with the required format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Upload CSV File</CardTitle>
              <CardDescription>
                Select your CSV file with product data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Click to select CSV file'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV files only'}
                  </p>
                </div>

                {file && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      File selected: {file.name}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={resetImport}>
                      <X className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Review Preview</CardTitle>
                <CardDescription>
                  Verify your data before importing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">
                      {preview.valid.length} valid products
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm">
                      {preview.invalid.length} invalid products
                    </span>
                  </div>
                </div>

                {preview.invalid.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Found {preview.invalid.length} invalid rows:</strong>
                      <ul className="mt-2 space-y-1">
                        {preview.invalid.slice(0, 5).map((item, index) => (
                          <li key={index} className="text-sm">
                            Row {item.row}: {item.errors.join(', ')}
                          </li>
                        ))}
                        {preview.invalid.length > 5 && (
                          <li className="text-sm text-muted-foreground">
                            ... and {preview.invalid.length - 5} more
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {preview.valid.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Products to Import:</h4>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {preview.valid.slice(0, 10).map((product, index) => (
                        <div key={index} className="text-sm p-2 bg-muted rounded">
                          {product.name} - ${product.base_price}
                        </div>
                      ))}
                      {preview.valid.length > 10 && (
                        <div className="text-sm text-muted-foreground">
                          ... and {preview.valid.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Import */}
          {preview && preview.valid.length > 0 && !result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Step 4: Import Products</CardTitle>
                <CardDescription>
                  Start the import process
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importing ? (
                  <div className="space-y-4">
                    <Progress value={progress} />
                    <p className="text-sm text-center">
                      Importing products... {Math.round(progress)}%
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleImport} 
                    className="w-full"
                    disabled={preview.valid.length === 0}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import {preview.valid.length} Products
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{result.success} products imported</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span>{result.failed} products failed</span>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Import Errors:</strong>
                      <ul className="mt-2 space-y-1">
                        {result.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                        {result.errors.length > 10 && (
                          <li className="text-sm text-muted-foreground">
                            ... and {result.errors.length - 10} more
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button onClick={() => setIsOpen(false)} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}