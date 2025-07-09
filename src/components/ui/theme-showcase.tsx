import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export function ThemeShowcase() {
  const { theme, resolvedTheme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Theme System Preview</h2>
        </div>
        <p className="text-muted-foreground">
          Current: {theme} ({resolvedTheme}) • Enhanced color palette with better contrast
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Primary theme colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded bg-primary text-primary-foreground text-center text-sm font-medium">
                Primary
              </div>
              <div className="p-3 rounded bg-secondary text-secondary-foreground text-center text-sm font-medium">
                Secondary
              </div>
              <div className="p-3 rounded bg-muted text-muted-foreground text-center text-sm font-medium">
                Muted
              </div>
              <div className="p-3 rounded bg-accent text-accent-foreground text-center text-sm font-medium">
                Accent
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Status Colors</CardTitle>
            <CardDescription>Semantic color variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="p-2 rounded bg-success text-success-foreground text-center text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Success
              </div>
              <div className="p-2 rounded bg-warning text-warning-foreground text-center text-sm font-medium flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning
              </div>
              <div className="p-2 rounded bg-destructive text-destructive-foreground text-center text-sm font-medium flex items-center justify-center gap-2">
                <XCircle className="h-4 w-4" />
                Error
              </div>
              <div className="p-2 rounded bg-info text-info-foreground text-center text-sm font-medium flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                Info
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
            <CardDescription>Buttons and form controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary Button</Button>
              <Button variant="outline" className="w-full">Outline Button</Button>
              <Button variant="ghost" className="w-full">Ghost Button</Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input fields and labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="demo-input">Sample Input</Label>
              <Input id="demo-input" placeholder="Enter some text..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-input-2">Disabled Input</Label>
              <Input id="demo-input-2" placeholder="Disabled" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Notification styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is a default alert message.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Theme system includes smooth transitions, proper contrast ratios, and accessibility considerations.
      </div>
    </div>
  );
}