import React, { useState, useMemo } from 'react';
import { useOrders, useOrderSearch } from '@/hooks/useOrders';
import { OrderHistoryItem, OrderFilter } from '@/types/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, RefreshCw, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface OrderHistoryProps {
  onOrderSelect?: (orderId: string) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ onOrderSelect }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  const { orders, loading, error, totalCount, currentPage, hasMore, refetch, loadMore, setCurrentPage } = useOrders(filter, 1, 20);
  const { searchResults, loading: searchLoading, searchOrders, clearSearch } = useOrderSearch();

  const displayOrders = useMemo(() => {
    return searchTerm ? searchResults : orders;
  }, [searchTerm, searchResults, orders]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchOrders(value);
    } else {
      clearSearch();
    }
  };

  const handleFilterChange = (newFilter: Partial<OrderFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start?: Date, end?: Date) => {
    setDateRange({ start, end });
    handleFilterChange({
      date_range: start && end ? {
        start: start.toISOString(),
        end: end.toISOString()
      } : undefined
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'payment_confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleOrderClick = (orderId: string) => {
    if (onOrderSelect) {
      onOrderSelect(orderId);
    } else {
      navigate(`/account/orders/${orderId}`);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error}</p>
            <Button onClick={refetch} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order History
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by order number or product name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select onValueChange={(value) => handleFilterChange({ status: value ? [value as any] : undefined })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                      <SelectItem value="in_production">In Production</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => handleDateRangeChange(date, dateRange.end)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => handleDateRangeChange(dateRange.start, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && !displayOrders.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Loading orders...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No orders found</p>
                          {searchTerm && (
                            <p className="text-sm">Try adjusting your search terms</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">{order.reference_number}</TableCell>
                        <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {formatStatus(order.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{order.job_count} item{order.job_count !== 1 ? 's' : ''}</div>
                            <div className="text-gray-500 text-xs">
                              {order.product_names.slice(0, 2).join(', ')}
                              {order.product_names.length > 2 && ` +${order.product_names.length - 2} more`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${order.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderClick(order.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {hasMore && !searchTerm && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}

            {totalCount > 0 && (
              <div className="text-sm text-gray-500 text-center">
                Showing {displayOrders.length} of {totalCount} orders
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};