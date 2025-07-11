import { supabase } from '@/integrations/supabase/client';

/**
 * Fix vendor addresses that might be stored incorrectly in the database
 * This script will update any vendor records that have address fields stored
 * as separate columns instead of as a JSONB object
 */
export async function fixVendorAddresses() {
  try {
    console.log('🔧 Fixing vendor addresses...');
    
    // Fetch all vendors
    const { data: vendors, error: fetchError } = await supabase
      .from('vendors')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching vendors:', fetchError);
      return;
    }
    
    if (!vendors || vendors.length === 0) {
      console.log('No vendors found');
      return;
    }
    
    // Check and fix each vendor
    let fixedCount = 0;
    
    for (const vendor of vendors) {
      // Skip if address is already properly formatted or null
      if (!vendor.address || (typeof vendor.address === 'object' && vendor.address.street)) {
        continue;
      }
      
      // Check if the vendor has old-style address fields
      const needsFix = vendor.city || vendor.state || vendor.zip_code || vendor.country;
      
      if (needsFix || typeof vendor.address === 'string') {
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
          .update({ 
            address: formattedAddress,
            // Clear old fields if they exist
            city: null,
            state: null,
            zip_code: null,
            country: null
          })
          .eq('id', vendor.id);
        
        if (updateError) {
          console.error(`Error updating vendor ${vendor.name}:`, updateError);
        } else {
          console.log(`✅ Fixed address for vendor: ${vendor.name}`);
          fixedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} vendor addresses`);
    
  } catch (error) {
    console.error('Error in fixVendorAddresses:', error);
  }
}

// Run the fix if this file is executed directly
if (import.meta.url === new URL(import.meta.url).href) {
  fixVendorAddresses();
}