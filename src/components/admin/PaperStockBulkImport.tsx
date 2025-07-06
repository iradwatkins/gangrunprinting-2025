import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi } from '@/api/global-options';
import type { TablesInsert } from '@/integrations/supabase/types';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ImportPreview {
  valid: (TablesInsert<'paper_stocks'> & { rowIndex: number })[];
  invalid: { row: number; data: any; errors: string[] }[];
}

interface PaperStockBulkImportProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaperStockBulkImport({ open, onClose, onSuccess }: PaperStockBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const csvTemplate = `name,description,weight,finish,price_per_square_inch,is_active
"Premium Matte Cardstock","High-quality matte finish cardstock",350,"Matte",0.0120,true
"Glossy Photo Paper","Glossy finish for vibrant prints",250,"Gloss",0.0150,true
"Standard Uncoated","Basic uncoated paper stock",120,"Uncoated",0.0080,true
"Recycled Kraft","Eco-friendly recycled paper",140,"Textured",0.0090,true`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paper-stocks-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validatePaperStock = (data: any, rowIndex: number): { isValid: boolean; errors: string[]; paperStock?: TablesInsert<'paper_stocks'> } => {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!data.weight || isNaN(Number(data.weight)) || Number(data.weight) < 1 || Number(data.weight) > 1000) {
      errors.push('Weight must be a number between 1 and 1000 GSM');
    }

    if (!data.finish || data.finish.trim() === '') {
      errors.push('Finish is required');
    }

    if (!data.price_per_square_inch || isNaN(Number(data.price_per_square_inch)) || Number(data.price_per_square_inch) <= 0) {
      errors.push('Price per square inch must be a positive number');
    }

    const isActive = data.is_active === 'true' || data.is_active === true || data.is_active === 'TRUE';

    if (errors.length === 0) {
      return {
        isValid: true,
        errors: [],
        paperStock: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          weight: Number(data.weight),
          finish: data.finish.trim(),
          price_per_square_inch: Number(data.price_per_square_inch),
          is_active: isActive
        }
      };
    }

    return { isValid: false, errors };
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(v => v.replace(/"/g, '').trim());
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setPreview(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text);

        if (parsedData.length === 0) {
          toast({
            title: "Invalid file",
            description: "The CSV file appears to be empty or invalid",
            variant: "destructive",
          });
          return;
        }

        const valid: (TablesInsert<'paper_stocks'> & { rowIndex: number })[] = [];
        const invalid: { row: number; data: any; errors: string[] }[] = [];

        parsedData.forEach((data, index) => {
          const validation = validatePaperStock(data, index + 2); // +2 for header and 1-based indexing
          if (validation.isValid && validation.paperStock) {
            valid.push({ ...validation.paperStock, rowIndex: index + 2 });
          } else {
            invalid.push({
              row: index + 2,
              data,
              errors: validation.errors
            });
          }
        });

        setPreview({ valid, invalid });
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: "Failed to parse the CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!preview || preview.valid.length === 0) return;

    setImporting(true);
    setProgress(0);

    const results: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    const total = preview.valid.length;

    for (let i = 0; i < preview.valid.length; i++) {
      const paperStock = preview.valid[i];
      
      try {
        const response = await paperStocksApi.createPaperStock(paperStock);
        
        if (response.error) {
          results.failed++;
          results.errors.push(`Row ${paperStock.rowIndex}: ${response.error}`);
        } else {
          results.success++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${paperStock.rowIndex}: Failed to create paper stock`);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setResult(results);
    setImporting(false);

    if (results.success > 0) {
      onSuccess();
      toast({
        title: "Import completed",
        description: `Successfully imported ${results.success} paper stocks${results.failed > 0 ? ` (${results.failed} failed)` : ''}`,
        variant: results.failed > 0 ? "destructive" : "default",
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setProgress(0);
    setImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Paper Stocks
          </DialogTitle>
          <DialogDescription>
            Import multiple paper stocks from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Download Template</CardTitle>
              <CardDescription>
                Download the CSV template to ensure your file has the correct format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file containing paper stock data
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
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={importing}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {file ? file.name : 'Select CSV File'}
                </Button>
                
                {file && (
                  <div className="text-sm text-muted-foreground">
                    File size: {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {preview && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Import Preview
                  <div className="flex gap-2">
                    <Badge variant="default">{preview.valid.length} Valid</Badge>
                    {preview.invalid.length > 0 && (
                      <Badge variant="destructive">{preview.invalid.length} Invalid</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {preview.invalid.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {preview.invalid.length} rows have validation errors and will be skipped.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Valid entries preview */}
                {preview.valid.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Valid Paper Stocks ({preview.valid.length})</h4>
                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Price/sq in</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.valid.slice(0, 5).map((stock, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{stock.name}</TableCell>
                              <TableCell>{stock.weight}</TableCell>
                              <TableCell>{stock.finish}</TableCell>
                              <TableCell>${stock.price_per_square_inch?.toFixed(4)}</TableCell>
                              <TableCell>
                                <Badge variant={stock.is_active ? "default" : "secondary"}>
                                  {stock.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                          {preview.valid.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">
                                ... and {preview.valid.length - 5} more
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Invalid entries */}
                {preview.invalid.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Invalid Rows ({preview.invalid.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {preview.invalid.map((item, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Row {item.row}:</strong> {item.errors.join(', ')}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Import button */}
                {preview.valid.length > 0 && (
                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing... {progress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import {preview.valid.length} Paper Stocks
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {importing && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing paper stocks...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.success}</div>
                    <div className="text-sm text-muted-foreground">Successfully imported</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed to import</div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleClose} className="w-full">
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