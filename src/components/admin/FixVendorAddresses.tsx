import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function FixVendorAddresses() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fixVendorAddresses = async () => {
    setIsFixing(true);
    setResult(null);
    
    try {
      // Fetch all vendors
      const { data: vendors, error: fetchError } = await supabase
        .from('vendors')
        .select('*');
      
      if (fetchError) {
        throw new Error(`Failed to fetch vendors: ${fetchError.message}`);
      }
      
      if (!vendors || vendors.length === 0) {
        setResult({ success: true, message: 'No vendors found to fix' });
        return;
      }
      
      let fixedCount = 0;
      const errors: string[] = [];
      
      for (const vendor of vendors) {
        // Skip if address is already properly formatted or null
        if (!vendor.address || (typeof vendor.address === 'object' && vendor.address.street)) {
          continue;
        }
        
        // Check if the vendor has old-style address fields or string address
        const needsFix = vendor.city || vendor.state || vendor.zip_code || vendor.country || typeof vendor.address === 'string';
        
        if (needsFix) {
          try {
            // Create properly formatted address object
            const formattedAddress = {
              street: typeof vendor.address === 'string' ? vendor.address : vendor.address || '',
              city: vendor.city || '',
              state: vendor.state || '',
              zip: vendor.zip_code || vendor.zip || '',
              country: vendor.country || 'USA'
            };
            
            // Update the vendor with the properly formatted address
            const { error: updateError } = await supabase
              .from('vendors')
              .update({ address: formattedAddress })
              .eq('id', vendor.id);
            
            if (updateError) {
              errors.push(`${vendor.name}: ${updateError.message}`);
            } else {
              fixedCount++;
            }
          } catch (error) {
            errors.push(`${vendor.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
      
      if (errors.length > 0) {
        setResult({ 
          success: false, 
          message: `Fixed ${fixedCount} vendors, but encountered errors: ${errors.join(', ')}`
        });
      } else {
        setResult({ 
          success: true, 
          message: fixedCount > 0 
            ? `Successfully fixed ${fixedCount} vendor addresses` 
            : 'All vendor addresses are already properly formatted'
        });
      }
      
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Fix Vendor Addresses</CardTitle>
        <CardDescription>
          This utility will fix any vendor addresses that are stored in the old format 
          (separate fields) and convert them to the new JSONB format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={fixVendorAddresses} 
          disabled={isFixing}
          className="w-full"
        >
          {isFixing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fixing vendor addresses...
            </>
          ) : (
            'Fix Vendor Addresses'
          )}
        </Button>
        
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a one-time operation. After running this fix, vendor addresses will be 
            properly stored in the database and the React rendering error should be resolved.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}