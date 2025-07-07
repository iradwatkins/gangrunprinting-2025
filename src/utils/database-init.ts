import { supabase } from '@/integrations/supabase/client';

export async function ensureTablesExist() {
  const tables = [
    'product_categories', 
    'paper_stocks', 
    'coatings', 
    'print_sizes', 
    'turnaround_times', 
    'add_ons',
    'quantities',
    'sides',
    'vendors',
    'products'
  ];
  
  const results: Record<string, { exists: boolean; error?: string; count?: number }> = {};
  
  for (const table of tables) {
    try {
      console.log(`Checking table: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking table ${table}:`, error);
        results[table] = { exists: false, error: error.message };
      } else {
        console.log(`Table ${table} exists with ${count} rows`);
        results[table] = { exists: true, count: count || 0 };
      }
    } catch (error) {
      console.error(`Exception checking table ${table}:`, error);
      results[table] = { 
        exists: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  return results;
}

export async function createMissingTables() {
  try {
    console.log('Creating missing tables...');
    
    // Create quantities table if it doesn't exist
    const { error: quantitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.quantities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          value INTEGER,
          is_custom BOOLEAN NOT NULL DEFAULT false,
          min_custom_value INTEGER,
          increment_value INTEGER,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
        
        INSERT INTO public.quantities (name, value, is_custom, is_active) VALUES 
          ('25', 25, false, true),
          ('50', 50, false, true),
          ('100', 100, false, true),
          ('250', 250, false, true),
          ('500', 500, false, true),
          ('1000', 1000, false, true),
          ('2500', 2500, false, true),
          ('5000', 5000, false, true),
          ('Custom', NULL, true, true)
        ON CONFLICT (name) DO NOTHING;
      `
    });
    
    if (quantitiesError) {
      console.warn('Could not create quantities table:', quantitiesError);
    }
    
    // Create sides table if it doesn't exist
    const { error: sidesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.sides (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000,
          tooltip_text TEXT,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        
        CREATE INDEX IF NOT EXISTS idx_sides_active ON public.sides(is_active);
        
        INSERT INTO public.sides (name, multiplier, tooltip_text, is_active) VALUES 
          ('Single Sided', 1.0000, 'Print on one side only', true),
          ('Double Sided (4/4)', 1.8000, 'Print on both sides (front and back)', true)
        ON CONFLICT (name) DO NOTHING;
      `
    });
    
    if (sidesError) {
      console.warn('Could not create sides table:', sidesError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating tables:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function initializeBasicData() {
  try {
    console.log('Initializing basic data...');
    
    // Check if we have any categories
    const { data: categories, error: catError } = await supabase
      .from('product_categories')
      .select('*')
      .limit(1);
    
    if (catError) {
      throw new Error(`Categories check failed: ${catError.message}`);
    }
    
    // If no categories exist, create a basic one
    if (!categories || categories.length === 0) {
      console.log('No categories found, creating basic category...');
      const { error: insertError } = await supabase
        .from('product_categories')
        .insert({
          name: 'Flyers & Postcards',
          slug: 'flyers-postcards',
          description: 'Marketing materials and promotional items',
          is_active: true,
          sort_order: 1
        });
      
      if (insertError && !insertError.message.includes('duplicate key')) {
        console.error('Error creating basic category:', insertError);
      } else {
        console.log('Basic category created successfully');
      }
    }
    
    // Check if we have any paper stocks
    const { data: paperStocks, error: paperError } = await supabase
      .from('paper_stocks')
      .select('*')
      .limit(1);
    
    if (paperError) {
      throw new Error(`Paper stocks check failed: ${paperError.message}`);
    }
    
    // If no paper stocks exist, create basic ones
    if (!paperStocks || paperStocks.length === 0) {
      console.log('No paper stocks found, creating basic paper stocks...');
      const { error: insertError } = await supabase
        .from('paper_stocks')
        .insert([
          {
            name: '14pt Card Stock',
            weight: 300,
            price_per_sq_inch: 0.0085,
            description: 'Premium thick card stock',
            is_active: true
          },
          {
            name: '100lb Text Paper',
            weight: 148,
            price_per_sq_inch: 0.0055,
            description: 'High-quality text paper',
            is_active: true
          }
        ]);
      
      if (insertError && !insertError.message.includes('duplicate key')) {
        console.error('Error creating basic paper stocks:', insertError);
      } else {
        console.log('Basic paper stocks created successfully');
      }
    }
    
    // Check if we have any vendors
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1);
    
    if (vendorError) {
      throw new Error(`Vendors check failed: ${vendorError.message}`);
    }
    
    // If no vendors exist, create a basic one
    if (!vendors || vendors.length === 0) {
      console.log('No vendors found, creating basic vendor...');
      const { error: insertError } = await supabase
        .from('vendors')
        .insert({
          name: 'Default Print Vendor',
          email: 'orders@printvendor.com',
          phone: '(555) 123-4567',
          address: {
            street: '123 Print Street',
            city: 'Print City',
            state: 'CA',
            zip: '90210'
          },
          supported_shipping_carriers: ['FedEx', 'UPS'],
          incoming_email_addresses: ['orders@printvendor.com'],
          is_active: true
        });
      
      if (insertError && !insertError.message.includes('duplicate key')) {
        console.error('Error creating basic vendor:', insertError);
      } else {
        console.log('Basic vendor created successfully');
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}