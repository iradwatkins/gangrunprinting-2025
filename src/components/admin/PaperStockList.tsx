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
import { supabase } from '@/integrations/supabase/client';
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
  }, [filters.search, filters.page, filters.limit, filters.is_active]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Add 10-second timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 10 seconds')), 10000)
      );

      // Direct Supabase query - no auth check needed
      const queryPromise = supabase
        .from('paper_stocks')
        .select('*')
        .order('name');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      setPaperStocks(data || []);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load paper stocks',
        variant: "destructive",
      });
      setPaperStocks([]);
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Loading Paper Stocks...
          </CardTitle>
          <CardDescription>
            Please wait while we load your paper stock data (timeout: 10s)
          </CardDescription>
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
      {/* Inline Form */}
      {showForm && (
        <PaperStockForm
          paperStock={editingStock}
          onSuccess={() => {
            loadData();
            setShowForm(false);
            setEditingStock(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingStock(null);
          }}
        />
      )}

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
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search paper stocks..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <Select onValueChange={(value) => handleFilterChange('is_active', value === 'true' ? true : value === 'false' ? false : value === 'all' ? undefined : undefined)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Paper Stock
              </Button>

              <Button variant="outline" onClick={() => setShowBulkImport(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </div>
          </div>

          {/* Paper Stocks Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name & Sides Options</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Available Coatings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products Using</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-12 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : paperStocks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Palette className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">No information at this time</h3>
                          <p className="text-muted-foreground">Create your first paper stock to get started with product configuration.</p>
                        </div>
                        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Paper Stock
                        </Button>
                      </div>
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
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stock.single_sided_available && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Single</span>
                            )}
                            {stock.double_sided_available && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Double</span>
                            )}
                            {stock.second_side_markup_percent && stock.second_side_markup_percent > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded">
                                +{stock.second_side_markup_percent}%
                              </span>
                            )}
                            {/* Show enhanced options if stored in tooltip_text */}
                            {(() => {
                              try {
                                const extraData = stock.tooltip_text ? JSON.parse(stock.tooltip_text) : null;
                                if (extraData?.available_sides) {
                                  return extraData.available_sides.map((side: string) => (
                                    <span key={side} className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                                      {side === 'single_sided' && 'Single'}
                                      {side === 'double_sided_different' && 'Double (Diff)'}
                                      {side === 'double_sided_same' && 'Double (Same)'}
                                    </span>
                                  ));
                                }
                                return null;
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{stock.weight} GSI</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>${stock.price_per_sq_inch?.toFixed(2) || '0.00'}/sq in</div>
                          {stock.second_side_markup_percent && stock.second_side_markup_percent > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Double: +{stock.second_side_markup_percent}%
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            try {
                              const extraData = stock.tooltip_text ? JSON.parse(stock.tooltip_text) : null;
                              if (extraData?.available_coatings && Array.isArray(extraData.available_coatings)) {
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {extraData.available_coatings.map((coating: string) => (
                                      <span key={coating} className="text-xs bg-purple-100 text-purple-800 px-1 rounded">
                                        {coating === 'high_gloss_uv' && 'UV'}
                                        {coating === 'high_gloss_uv_one_side' && 'UV (1-Side)'}
                                        {coating === 'gloss_aqueous' && 'Gloss'}
                                        {coating === 'matte_aqueous' && 'Matte'}
                                      </span>
                                    ))}
                                  </div>
                                );
                              }
                              return <span className="text-muted-foreground">Basic coatings</span>;
                            } catch {
                              return <span className="text-muted-foreground">Basic coatings</span>;
                            }
                          })()}
                        </div>
                      </TableCell>
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

      {/* Bulk Import Dialog */}
      <PaperStockBulkImport
        open={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        onSuccess={loadData}
      />
    </div>
  );
}