import React from 'react';
import { FileManager } from '@/components/files/FileManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Shield, 
  Zap, 
  CheckCircle 
} from 'lucide-react';

export default function FilesPage() {
  const features = [
    {
      icon: Upload,
      title: 'Drag & Drop Upload',
      description: 'Easy file uploads with drag-and-drop support for multiple files'
    },
    {
      icon: Shield,
      title: 'File Validation',
      description: 'Automatic validation of file types, sizes, and print requirements'
    },
    {
      icon: Zap,
      title: 'Instant Preview',
      description: 'Preview images and PDFs directly in the browser'
    },
    {
      icon: CheckCircle,
      title: 'Quality Checks',
      description: 'Resolution, color space, and print quality validation'
    }
  ];

  const supportedFormats = [
    { type: 'Images', formats: ['JPG', 'PNG', 'TIFF'], icon: ImageIcon, color: 'text-blue-600' },
    { type: 'Documents', formats: ['PDF'], icon: FileText, color: 'text-red-600' },
    { type: 'Vector', formats: ['AI', 'EPS'], icon: FileText, color: 'text-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">File Management</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Upload, manage, and organize your artwork files. Our system automatically validates
            files for print quality and provides instant feedback to ensure the best results.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Supported Formats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supported File Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supportedFormats.map((category, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{category.type}</h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {category.formats.map((format) => (
                      <Badge key={format} variant="secondary">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>File Guidelines:</strong> For best print quality, use high-resolution files (300+ DPI), 
            include 0.125" bleed for full-bleed designs, and convert text to outlines in vector files. 
            Maximum file size is 100MB per file.
          </AlertDescription>
        </Alert>

        {/* File Manager */}
        <FileManager allowUpload allowDelete />
      </div>
    </div>
  );
}