import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CustomerSegment, SegmentCondition } from '../../types/email';
import { emailSegmentApi } from '../../api/email';
import { Plus, Trash2, Users, Filter, Eye } from 'lucide-react';

interface SegmentBuilderProps {
  segment?: CustomerSegment;
  onSave: (segment: Partial<CustomerSegment>) => void;
  onCancel: () => void;
}

const FIELD_OPTIONS = [
  { value: 'email', label: 'Email Address' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'company', label: 'Company' },
  { value: 'total_orders', label: 'Total Orders' },
  { value: 'total_spent', label: 'Total Spent' },
  { value: 'last_order_date', label: 'Last Order Date' },
  { value: 'first_order_date', label: 'First Order Date' },
  { value: 'customer_type', label: 'Customer Type' },
  { value: 'broker_id', label: 'Broker' },
  { value: 'created_at', label: 'Registration Date' },
  { value: 'tags', label: 'Tags' },
  { value: 'location', label: 'Location' },
  { value: 'order_frequency', label: 'Order Frequency' },
  { value: 'avg_order_value', label: 'Average Order Value' },
];

const OPERATOR_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In List' },
  { value: 'not_in', label: 'Not In List' },
  { value: 'exists', label: 'Exists' },
  { value: 'not_exists', label: 'Does Not Exist' },
];

const SegmentBuilder: React.FC<SegmentBuilderProps> = ({ segment, onSave, onCancel }) => {
  const [segmentData, setSegmentData] = useState({
    name: segment?.name || '',
    description: segment?.description || '',
    conditions: segment?.conditions || [
      {
        field: 'email',
        operator: 'exists' as const,
        value: '',
        logic: 'and' as const,
      }
    ],
  });

  const [previewData, setPreviewData] = useState<{ customers: any[]; total: number } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const addCondition = () => {
    setSegmentData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          field: 'email',
          operator: 'exists' as const,
          value: '',
          logic: 'and' as const,
        }
      ]
    }));
  };

  const removeCondition = (index: number) => {
    setSegmentData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, updates: Partial<SegmentCondition>) => {
    setSegmentData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    }));
  };

  const handlePreview = async () => {
    if (segmentData.conditions.length === 0) return;

    try {
      setPreviewLoading(true);
      const response = await emailSegmentApi.getSegmentPreview(segmentData.conditions, 10);
      setPreviewData(response);
    } catch (error) {
      console.error('Failed to preview segment:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSave = () => {
    if (!segmentData.name.trim()) {
      alert('Please enter a segment name');
      return;
    }

    if (segmentData.conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }

    onSave(segmentData);
  };

  const getInputType = (field: string) => {
    switch (field) {
      case 'total_orders':
      case 'total_spent':
      case 'avg_order_value':
      case 'order_frequency':
        return 'number';
      case 'last_order_date':
      case 'first_order_date':
      case 'created_at':
        return 'date';
      default:
        return 'text';
    }
  };

  const shouldShowValueInput = (operator: string) => {
    return !['exists', 'not_exists'].includes(operator);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
          <CardDescription>Define your customer segment criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Segment Name</Label>
              <Input
                id="name"
                value={segmentData.name}
                onChange={(e) => setSegmentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter segment name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={segmentData.description}
                onChange={(e) => setSegmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter segment description"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conditions</CardTitle>
              <CardDescription>Define the criteria for this segment</CardDescription>
            </div>
            <Button onClick={addCondition} size="sm">
              <Plus size={16} className="mr-1" />
              Add Condition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segmentData.conditions.map((condition, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="font-medium">Condition {index + 1}</span>
                  </div>
                  {segmentData.conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  {index > 0 && (
                    <div>
                      <Label>Logic</Label>
                      <Select
                        value={condition.logic}
                        onValueChange={(value) => updateCondition(index, { logic: value as 'and' | 'or' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="and">AND</SelectItem>
                          <SelectItem value="or">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className={index === 0 ? 'md:col-span-2' : ''}>
                    <Label>Field</Label>
                    <Select
                      value={condition.field}
                      onValueChange={(value) => updateCondition(index, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Operator</Label>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(index, { operator: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATOR_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {shouldShowValueInput(condition.operator) && (
                    <div>
                      <Label>Value</Label>
                      <Input
                        type={getInputType(condition.field)}
                        value={condition.value}
                        onChange={(e) => updateCondition(index, { value: e.target.value })}
                        placeholder="Enter value"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See which customers match your criteria</CardDescription>
            </div>
            <Button onClick={handlePreview} disabled={previewLoading}>
              <Eye size={16} className="mr-1" />
              {previewLoading ? 'Loading...' : 'Preview'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {previewData ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                <span className="font-medium">
                  {previewData.total} customers match this segment
                </span>
              </div>
              
              {previewData.customers.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <span className="font-medium">Sample Customers (First 10)</span>
                  </div>
                  <div className="divide-y">
                    {previewData.customers.map((customer, index) => (
                      <div key={index} className="px-4 py-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>${customer.total_spent || 0}</div>
                          <div>{customer.total_orders || 0} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Click "Preview" to see which customers match your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {segment ? 'Update Segment' : 'Create Segment'}
        </Button>
      </div>
    </div>
  );
};

export default SegmentBuilder;