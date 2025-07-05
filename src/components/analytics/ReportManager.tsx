import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Download, 
  Clock,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { ReportBuilder } from './ReportBuilder';
import type { AnalyticsReport, ExportFormat } from '../../types/analytics';

export function ReportManager() {
  const {
    reports,
    loading,
    error,
    loadReports,
    runReport,
    exportData,
    clearError
  } = useAnalytics(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<AnalyticsReport | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [runningReports, setRunningReports] = useState<Set<string>>(new Set());
  const [exportingReports, setExportingReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRunReport = async (reportId: string) => {
    try {
      setRunningReports(prev => new Set(prev).add(reportId));
      await runReport(reportId);
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setRunningReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleExportReport = async (reportId: string, format: ExportFormat) => {
    try {
      setExportingReports(prev => new Set(prev).add(reportId));
      await exportData(reportId, format);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExportingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleEditReport = (report: AnalyticsReport) => {
    setSelectedReport(report);
    setIsBuilderOpen(true);
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsBuilderOpen(true);
  };

  const handleSaveReport = () => {
    setIsBuilderOpen(false);
    setSelectedReport(null);
    loadReports(); // Refresh the list
  };

  const handleCancelEdit = () => {
    setIsBuilderOpen(false);
    setSelectedReport(null);
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'dashboard':
        return <BarChart3 className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportTypeBadge = (type: string) => {
    const variants = {
      dashboard: 'default',
      scheduled: 'secondary',
      custom: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {getReportTypeIcon(type)}
        <span className="ml-1">{type}</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Manager</h2>
          <p className="text-muted-foreground">
            Create, manage, and export analytics reports
          </p>
        </div>
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-red-600">
              <span>Error: {error}</span>
              <Button onClick={clearError} variant="ghost" size="sm">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No reports match your search.' : 'No reports created yet.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Export Formats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{getReportTypeBadge(report.report_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {report.export_formats.map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>{formatDate(report.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {/* Run Report */}
                        <Button
                          onClick={() => handleRunReport(report.id)}
                          disabled={runningReports.has(report.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Play className="h-4 w-4" />
                        </Button>

                        {/* Export Dropdown */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Export Report</DialogTitle>
                              <DialogDescription>
                                Choose a format to export "{report.name}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-2">
                              {report.export_formats.map((format) => (
                                <Button
                                  key={format}
                                  onClick={() => handleExportReport(report.id, format)}
                                  disabled={exportingReports.has(report.id)}
                                  variant="outline"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {format.toUpperCase()}
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Report */}
                        <Button
                          onClick={() => handleEditReport(report)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Schedule (if applicable) */}
                        {report.report_type === 'scheduled' && report.schedule && (
                          <Badge variant="secondary" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {report.schedule.frequency}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport ? 'Edit Report' : 'Create New Report'}
            </DialogTitle>
            <DialogDescription>
              {selectedReport 
                ? `Modify the configuration for "${selectedReport.name}"`
                : 'Configure your custom analytics report'
              }
            </DialogDescription>
          </DialogHeader>
          <ReportBuilder
            report={selectedReport || undefined}
            onSave={handleSaveReport}
            onCancel={handleCancelEdit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}