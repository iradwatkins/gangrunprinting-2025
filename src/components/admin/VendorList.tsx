import { useState, useEffect } from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Truck,
  ToggleLeft,
  ToggleRight,
  Star,
  StarIcon,
  MapPin,
  Phone,
  Mail,
  Package,
  Award,
  Building,
  BarChart3,
  Send
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
import { vendorsApi, type VendorFilters } from '@/api/vendors';
import { VendorForm } from '@/components/admin/VendorForm';
import { VendorPerformance } from '@/components/admin/VendorPerformance';
import { VendorProductAssignment } from '@/components/admin/VendorProductAssignment';
import { VendorEmailModal } from '@/components/admin/VendorEmailModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Vendor = Tables<'vendors'> & {
  product_count?: number;
  order_volume?: number;
};

interface StarRatingProps {
  rating: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

function StarRating({ rating, readonly = true, onRatingChange }: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (star: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readonly) {
      setHoveredRating(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = readonly ? rating : (hoveredRating || rating);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 cursor-${readonly ? 'default' : 'pointer'} ${
            star <= displayRating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        ({rating?.toFixed(1) || '0.0'})
      </span>
    </div>
  );
}

export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<VendorFilters>({
    page: 1,
    limit: 20
  });
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceVendor, setPerformanceVendor] = useState<Vendor | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentVendor, setAssignmentVendor] = useState<Vendor | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailVendor, setEmailVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading vendors...');
      const response = await vendorsApi.getVendors(filters);
      
      console.log('📋 Vendors API response:', response);
      
      if (response.error) {
        console.error('❌ Vendors API error:', response.error);
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        const vendors = response.data || [];
        console.log('✅ Vendors loaded:', vendors.length);
        setVendors(vendors);
      }
    } catch (error) {
      console.error('💥 Failed to load vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors. Check console for details.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: keyof VendorFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleToggleActive = async (vendor: Vendor) => {
    try {
      const response = await vendorsApi.updateVendor(vendor.id, {
        ...vendor,
        is_active: !vendor.is_active
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
          description: `Vendor ${vendor.is_active ? 'deactivated' : 'activated'} successfully`,
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRating = async (vendor: Vendor, newRating: number) => {
    try {
      const response = await vendorsApi.updateVendor(vendor.id, {
        ...vendor,
        rating: newRating
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
          description: "Vendor rating updated successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor rating",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await vendorsApi.deleteVendor(vendor.id);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Vendor deleted successfully",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: any): string => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;
    
    const parts = [
      address.city,
      address.state,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ') || 'Address incomplete';
  };

  const formatCapabilities = (capabilities: any): string[] => {
    if (!capabilities) return [];
    if (typeof capabilities === 'string') return [capabilities];
    if (Array.isArray(capabilities)) return capabilities;
    
    // Handle JSONB object
    const methods = capabilities.printing_methods || [];
    const specialties = capabilities.specialties || [];
    return [...methods, ...specialties].slice(0, 3); // Show first 3
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
        <CardContent className="pt-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vendors..."
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
              Add Vendor
            </Button>
          </div>

          {/* Vendors Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Info</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No vendors found. Add your first vendor to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Building className="h-8 w-8 text-gray-400 bg-gray-100 rounded p-1" />
                          <div>
                            <div className="font-semibold">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor.slug}
                            </div>
                            {vendor.pricing_tier && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {vendor.pricing_tier}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {vendor.contact_phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {vendor.contact_email || 'N/A'}
                          </div>
                          {vendor.contact_name && (
                            <div className="text-xs text-muted-foreground">
                              Contact: {vendor.contact_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {formatAddress(vendor.address)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {formatCapabilities(vendor.capabilities).map((capability, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs mr-1">
                              {capability}
                            </Badge>
                          ))}
                          {formatCapabilities(vendor.capabilities).length === 0 && (
                            <span className="text-sm text-muted-foreground">No capabilities listed</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={vendor.rating || 0}
                          readonly={false}
                          onRatingChange={(rating) => handleUpdateRating(vendor, rating)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={vendor.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(vendor)}
                        >
                          {vendor.is_active ? (
                            <><ToggleRight className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><ToggleLeft className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="link" size="sm" className="h-auto p-0 flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {vendor.product_count || 0} products
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
                            <DropdownMenuItem 
                              onClick={() => {
                                setEmailVendor(vendor);
                                setShowEmailModal(true);
                              }}
                              disabled={!vendor.contact_email}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                              setPerformanceVendor(vendor);
                              setShowPerformance(true);
                            }}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setAssignmentVendor(vendor);
                              setShowAssignment(true);
                            }}>
                              <Package className="h-4 w-4 mr-2" />
                              Manage Products
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingVendor(vendor);
                              setShowForm(true);
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(vendor)}>
                              {vendor.is_active ? (
                                <><ToggleLeft className="h-4 w-4 mr-2" /> Deactivate</>
                              ) : (
                                <><ToggleRight className="h-4 w-4 mr-2" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(vendor)}
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
          {vendors.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {vendors.length} vendors
              </div>
              {/* TODO: Add pagination component when needed */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Form Dialog */}
      <VendorForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingVendor(null);
          }
        }}
        vendor={editingVendor}
        onSuccess={loadData}
      />

      {/* Vendor Performance Dialog */}
      <Dialog open={showPerformance} onOpenChange={setShowPerformance}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Performance Analytics</DialogTitle>
          </DialogHeader>
          {performanceVendor && (
            <VendorPerformance vendor={performanceVendor} />
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Product Assignment Dialog */}
      <Dialog open={showAssignment} onOpenChange={setShowAssignment}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Assignment Management</DialogTitle>
          </DialogHeader>
          {assignmentVendor && (
            <VendorProductAssignment vendor={assignmentVendor} />
          )}
        </DialogContent>
      </Dialog>

      {/* Vendor Email Modal */}
      <VendorEmailModal
        vendor={emailVendor}
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
      />
    </div>
  );
}