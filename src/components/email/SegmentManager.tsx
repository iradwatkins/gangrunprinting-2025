import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { CustomerSegment } from '../../types/email';
import { emailSegmentApi } from '../../api/email';
import SegmentBuilder from './SegmentBuilder';
import { 
  Plus, 
  Search, 
  Users, 
  Edit, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Download, 
  MoreHorizontal,
  Filter,
  Calendar
} from 'lucide-react';

interface SegmentManagerProps {
  onSegmentSelect?: (segment: CustomerSegment) => void;
  selectionMode?: boolean;
}

const SegmentManager: React.FC<SegmentManagerProps> = ({ onSegmentSelect, selectionMode = false }) => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      
      // Mock segments data
      const mockSegments: CustomerSegment[] = [
        {
          id: '1',
          name: 'New Customers',
          description: 'Customers who joined in the last 30 days',
          conditions: [
            {
              field: 'created_at',
              operator: 'is_after',
              value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          customer_count: 150,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'High Value Customers',
          description: 'Customers with total orders over $500',
          conditions: [
            {
              field: 'total_spent',
              operator: 'greater_than',
              value: '500',
            }
          ],
          customer_count: 85,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Business Customers',
          description: 'Customers with company information',
          conditions: [
            {
              field: 'company',
              operator: 'is_not_empty',
              value: '',
            }
          ],
          customer_count: 320,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Inactive Customers',
          description: 'Customers with no orders in the last 90 days',
          conditions: [
            {
              field: 'last_order_date',
              operator: 'is_before',
              value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            }
          ],
          customer_count: 45,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setSegments(mockSegments);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSegment = () => {
    setSelectedSegment(null);
    setBuilderOpen(true);
  };

  const handleEditSegment = (segment: CustomerSegment) => {
    setSelectedSegment(segment);
    setBuilderOpen(true);
  };

  const handleSaveSegment = async (segmentData: Partial<CustomerSegment>) => {
    try {
      if (selectedSegment) {
        const updatedSegment = await emailSegmentApi.updateSegment(selectedSegment.id, segmentData);
        setSegments(prev => prev.map(s => s.id === selectedSegment.id ? updatedSegment : s));
      } else {
        const newSegment = await emailSegmentApi.createSegment({
          ...segmentData,
          created_by: 'current-user', // TODO: Get from auth context
        } as any);
        setSegments(prev => [newSegment, ...prev]);
      }
      setBuilderOpen(false);
      setSelectedSegment(null);
    } catch (error) {
      console.error('Failed to save segment:', error);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      await emailSegmentApi.deleteSegment(segmentId);
      setSegments(prev => prev.filter(s => s.id !== segmentId));
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const handleRefreshSegment = async (segmentId: string) => {
    try {
      const refreshedSegment = await emailSegmentApi.refreshSegment(segmentId);
      setSegments(prev => prev.map(s => s.id === segmentId ? refreshedSegment : s));
    } catch (error) {
      console.error('Failed to refresh segment:', error);
    }
  };

  const handleExportSegment = async (segmentId: string, format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const blob = await emailSegmentApi.exportSegmentCustomers(segmentId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment-${segmentId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export segment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading segments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Segments</h2>
          <p className="text-gray-600">Manage your customer segments for targeted campaigns</p>
        </div>
        {!selectionMode && (
          <Button onClick={handleCreateSegment} className="flex items-center gap-2">
            <Plus size={16} />
            Create Segment
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          placeholder="Search segments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSegments.map((segment) => (
          <Card 
            key={segment.id} 
            className={`hover:shadow-lg transition-shadow ${selectionMode ? 'cursor-pointer' : ''}`}
            onClick={() => selectionMode && onSegmentSelect?.(segment)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Filter size={16} className="text-blue-600" />
                    <Badge variant="secondary">
                      {formatNumber(segment.customer_count)} customers
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {segment.description || 'No description'}
                  </CardDescription>
                </div>
                {!selectionMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditSegment(segment)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRefreshSegment(segment.id)}>
                        <RefreshCw size={16} className="mr-2" />
                        Refresh Count
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportSegment(segment.id, 'csv')}>
                        <Download size={16} className="mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportSegment(segment.id, 'xlsx')}>
                        <Download size={16} className="mr-2" />
                        Export Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSegment(segment.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>Conditions:</strong> {segment.conditions.length} rule{segment.conditions.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    Created by {segment.created_by}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(segment.created_at)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSegments.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'No segments match your search criteria.'
              : 'Get started by creating your first customer segment.'}
          </p>
          {!selectionMode && (
            <Button onClick={handleCreateSegment}>
              <Plus size={16} className="mr-2" />
              Create Your First Segment
            </Button>
          )}
        </div>
      )}

      {/* Segment Builder Dialog */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSegment ? 'Edit Segment' : 'Create New Segment'}
            </DialogTitle>
          </DialogHeader>
          <SegmentBuilder
            segment={selectedSegment || undefined}
            onSave={handleSaveSegment}
            onCancel={() => setBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SegmentManager;