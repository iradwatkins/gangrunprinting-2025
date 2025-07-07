import { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Palette,
  ToggleLeft,
  ToggleRight,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi, type GlobalOptionsFilters } from '@/api/global-options';
import { PaperStockForm } from '@/components/admin/PaperStockForm';
import { PaperStockBulkImport } from '@/components/admin/PaperStockBulkImport';
import type { Tables } from '@/integrations/supabase/types';

type PaperStock = Tables<'paper_stocks'>;

export function PaperStockList() {
  const [paperStocks, setPaperStocks] = useState<PaperStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<GlobalOptionsFilters>({
    page: 1,
    limit: 20
  });
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingStock, setEditingStock] = useState<PaperStock | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading paper stocks...');
      const response = await paperStocksApi.getPaperStocks(filters);
      
      console.log('Paper stocks API response:', response);
      
      if (response.error) {
        console.error('Paper stocks API error:', response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        const stocks = response.data || [];
        console.log('Paper stocks loaded:', stocks.length);
        setPaperStocks(stocks);
      }
    } catch (error) {
      console.error('Failed to load paper stocks:', error);
      toast({
        title: "Error",
        description: "Failed to load paper stocks",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof GlobalOptionsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleActive = async (stock: PaperStock) => {
    try {
      const response = await paperStocksApi.updatePaperStock(stock.id, {
        ...stock,
        is_active: !stock.is_active
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Paper stock ${stock.is_active ? 'deactivated' : 'activated'} successfully`,
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update paper stock status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (stock: PaperStock) => {
    if (!confirm(`Are you sure you want to delete "${stock.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await paperStocksApi.deletePaperStock(stock.id);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Paper stock deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete paper stock",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paper Stock Management
          </CardTitle>
          <CardDescription>
            Manage paper stocks and pricing for product configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search paper stocks..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <Select onValueChange={(value) => handleFilterChange('is_active', value === 'true' ? true : value === 'false' ? false : undefined)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Paper Stock
            </Button>

            <Button variant="outline" onClick={() => setShowBulkImport(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>

          {/* Paper Stocks Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Weight (GSM)</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Price/sq inch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products Using</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paperStocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No paper stocks found. Add your first paper stock to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  paperStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{stock.name}</div>
                          {stock.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {stock.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{stock.weight}</TableCell>
                      <TableCell>{stock.finish}</TableCell>
                      <TableCell>${stock.price_per_square_inch?.toFixed(4) || '0.0000'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={stock.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(stock)}
                        >
                          {stock.is_active ? (
                            <><ToggleRight className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><ToggleLeft className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0">
                          0 products
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setEditingStock(stock);
                              setShowForm(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(stock)}>
                              {stock.is_active ? (
                                <><ToggleLeft className="h-4 w-4 mr-2" /> Deactivate</>
                              ) : (
                                <><ToggleRight className="h-4 w-4 mr-2" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(stock)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination placeholder */}
          {paperStocks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {paperStocks.length} paper stocks
              </div>
              {/* TODO: Add pagination component when needed */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paper Stock Form Dialog */}
      <PaperStockForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStock(null);
        }}
        paperStock={editingStock}
        onSuccess={loadData}
      />

      {/* Bulk Import Dialog */}
      <PaperStockBulkImport
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={loadData}
      />
    </div>
  );
}