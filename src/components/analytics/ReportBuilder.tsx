import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Plus, 
  Trash2, 
  Download, 
  Calendar as CalendarIcon, 
  FileText, 
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { useAnalytics } from '../../hooks/useAnalytics';
import type {
  AnalyticsReport,
  DataSource,
  Visualization,
  AnalyticsFilter,
  ExportFormat,
  ReportSchedule
} from '../../types/analytics';

interface ReportBuilderProps {
  report?: AnalyticsReport;
  onSave?: (report: Partial<AnalyticsReport>) => void;
  onCancel?: () => void;
}

export function ReportBuilder({ report, onSave, onCancel }: ReportBuilderProps) {
  const { createReport, updateReport, exportData } = useAnalytics(false);
  
  const [formData, setFormData] = useState<Partial<AnalyticsReport>>({
    name: report?.name || '',
    description: report?.description || '',
    report_type: report?.report_type || 'custom',
    data_sources: report?.data_sources || [],
    filters: report?.filters || [],
    visualizations: report?.visualizations || [],
    export_formats: report?.export_formats || ['pdf'],
    recipients: report?.recipients || [],
    schedule: report?.schedule
  });

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const availableDataSources = [
    { table: 'orders', fields: ['id', 'status', 'total_amount', 'created_at', 'customer_id'] },
    { table: 'customers', fields: ['id', 'email', 'created_at', 'broker_id'] },
    { table: 'products', fields: ['id', 'name', 'category_id', 'price'] },
    { table: 'order_items', fields: ['order_id', 'product_id', 'quantity', 'price'] },
    { table: 'categories', fields: ['id', 'name', 'parent_id'] }
  ];

  const visualizationTypes = [
    { value: 'chart', label: 'Chart', icon: BarChart3 },
    { value: 'table', label: 'Table', icon: FileText },
    { value: 'metric', label: 'Metric', icon: DollarSign },
    { value: 'gauge', label: 'Gauge', icon: Users }
  ];

  const chartTypes = ['line', 'bar', 'pie', 'area', 'scatter'];
  const exportFormats: ExportFormat[] = ['pdf', 'csv', 'excel', 'json'];

  const handleInputChange = (field: keyof AnalyticsReport, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDataSource = () => {
    const newDataSource: DataSource = {
      table: '',
      fields: [],
      aggregations: []
    };
    
    setFormData(prev => ({
      ...prev,
      data_sources: [...(prev.data_sources || []), newDataSource]
    }));
  };

  const updateDataSource = (index: number, updates: Partial<DataSource>) => {
    setFormData(prev => ({
      ...prev,
      data_sources: prev.data_sources?.map((ds, i) => 
        i === index ? { ...ds, ...updates } : ds
      ) || []
    }));
  };

  const removeDataSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      data_sources: prev.data_sources?.filter((_, i) => i !== index) || []
    }));
  };

  const addFilter = () => {
    const newFilter: AnalyticsFilter = {
      field: '',
      operator: 'eq',
      value: ''
    };
    
    setFormData(prev => ({
      ...prev,
      filters: [...(prev.filters || []), newFilter]
    }));
  };

  const updateFilter = (index: number, updates: Partial<AnalyticsFilter>) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters?.map((filter, i) => 
        i === index ? { ...filter, ...updates } : filter
      ) || []
    }));
  };

  const removeFilter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index) || []
    }));
  };

  const addVisualization = () => {
    const newVisualization: Visualization = {
      type: 'chart',
      config: {
        title: '',
        chart_type: 'bar',
        show_legend: true,
        show_grid: true
      },
      data_query: '',
      position: { x: 0, y: 0, width: 6, height: 4 }
    };
    
    setFormData(prev => ({
      ...prev,
      visualizations: [...(prev.visualizations || []), newVisualization]
    }));
  };

  const updateVisualization = (index: number, updates: Partial<Visualization>) => {
    setFormData(prev => ({
      ...prev,
      visualizations: prev.visualizations?.map((viz, i) => 
        i === index ? { ...viz, ...updates } : viz
      ) || []
    }));
  };

  const removeVisualization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      visualizations: prev.visualizations?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = async () => {
    try {
      if (report?.id) {
        await updateReport(report.id, formData);
      } else {
        await createReport(formData);
      }
      onSave?.(formData);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!report?.id) return;
    
    try {
      setIsExporting(true);
      const result = await exportData(report.id, format);
      console.log('Export started:', result);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Report Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            <div>
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value: any) => handleInputChange('report_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter report description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Data Sources
            <Button onClick={addDataSource} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.data_sources?.map((dataSource, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Data Source {index + 1}</h4>
                <Button
                  onClick={() => removeDataSource(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Table</Label>
                  <Select
                    value={dataSource.table}
                    onValueChange={(value) => updateDataSource(index, { table: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDataSources.map((source) => (
                        <SelectItem key={source.table} value={source.table}>
                          {source.table}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Fields</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableDataSources
                      .find(s => s.table === dataSource.table)
                      ?.fields.map((field) => (
                        <Badge
                          key={field}
                          variant={dataSource.fields.includes(field) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newFields = dataSource.fields.includes(field)
                              ? dataSource.fields.filter(f => f !== field)
                              : [...dataSource.fields, field];
                            updateDataSource(index, { fields: newFields });
                          }}
                        >
                          {field}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Filters
            <Button onClick={addFilter} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.filters?.map((filter, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <div>
                <Label>Field</Label>
                <Input
                  value={filter.field}
                  onChange={(e) => updateFilter(index, { field: e.target.value })}
                  placeholder="Field name"
                />
              </div>
              
              <div>
                <Label>Operator</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(value: any) => updateFilter(index, { operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq">Equals</SelectItem>
                    <SelectItem value="ne">Not Equals</SelectItem>
                    <SelectItem value="gt">Greater Than</SelectItem>
                    <SelectItem value="gte">Greater Than or Equal</SelectItem>
                    <SelectItem value="lt">Less Than</SelectItem>
                    <SelectItem value="lte">Less Than or Equal</SelectItem>
                    <SelectItem value="in">In</SelectItem>
                    <SelectItem value="not_in">Not In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Value</Label>
                <Input
                  value={filter.value}
                  onChange={(e) => updateFilter(index, { value: e.target.value })}
                  placeholder="Filter value"
                />
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => removeFilter(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Visualizations
            <Button onClick={addVisualization} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Visualization
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.visualizations?.map((viz, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Visualization {index + 1}</h4>
                <Button
                  onClick={() => removeVisualization(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={viz.type}
                    onValueChange={(value: any) => updateVisualization(index, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visualizationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input
                    value={viz.config.title}
                    onChange={(e) => updateVisualization(index, {
                      config: { ...viz.config, title: e.target.value }
                    })}
                    placeholder="Visualization title"
                  />
                </div>
                
                {viz.type === 'chart' && (
                  <div>
                    <Label>Chart Type</Label>
                    <Select
                      value={viz.config.chart_type}
                      onValueChange={(value: any) => updateVisualization(index, {
                        config: { ...viz.config, chart_type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div>
                <Label>Data Query</Label>
                <Textarea
                  value={viz.data_query}
                  onChange={(e) => updateVisualization(index, { data_query: e.target.value })}
                  placeholder="Enter SQL query or data source configuration"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Export Formats</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {exportFormats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={format}
                    checked={formData.export_formats?.includes(format)}
                    onCheckedChange={(checked) => {
                      const newFormats = checked
                        ? [...(formData.export_formats || []), format]
                        : (formData.export_formats || []).filter(f => f !== format);
                      handleInputChange('export_formats', newFormats);
                    }}
                  />
                  <Label htmlFor={format}>{format.toUpperCase()}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Recipients (Email addresses, comma-separated)</Label>
            <Input
              value={formData.recipients?.join(', ') || ''}
              onChange={(e) => handleInputChange('recipients', 
                e.target.value.split(',').map(email => email.trim()).filter(Boolean)
              )}
              placeholder="user@example.com, admin@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {report?.id && (
            <>
              {formData.export_formats?.map((format) => (
                <Button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </Button>
              ))}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave}>
            {report?.id ? 'Update Report' : 'Create Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}