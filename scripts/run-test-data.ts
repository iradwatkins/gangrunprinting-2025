import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
  try {
    console.log('🚀 Starting test data insertion...');
    
    // Read the SQL file
    const sqlPath = join(__dirname, 'insert-test-data.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error inserting test data:', error);
      
      // If RPC doesn't exist, try inserting data programmatically
      console.log('📝 Attempting programmatic insertion...');
      await insertProgrammatically();
    } else {
      console.log('✅ Test data inserted successfully!');
    }
  } catch (error) {
    console.error('❌ Failed to insert test data:', error);
  }
}

async function insertProgrammatically() {
  try {
    // Insert categories
    const categories = [
      { name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards for networking and branding', is_active: true, sort_order: 1 },
      { name: 'Flyers', slug: 'flyers', description: 'Marketing flyers for promotions and events', is_active: true, sort_order: 2 },
      { name: 'Brochures', slug: 'brochures', description: 'Folded brochures for detailed product information', is_active: true, sort_order: 3 },
      { name: 'Postcards', slug: 'postcards', description: 'Direct mail postcards for marketing campaigns', is_active: true, sort_order: 4 },
      { name: 'Banners', slug: 'banners', description: 'Large format banners for events and displays', is_active: true, sort_order: 5 },
    ];

    console.log('📁 Inserting categories...');
    const { error: catError } = await supabase.from('product_categories').upsert(categories, { onConflict: 'slug' });
    if (catError) console.error('Category error:', catError);
    else console.log('✅ Categories inserted');

    // Insert vendors
    const vendors = [
      { 
        name: 'PrintPro Solutions', 
        contact_email: 'orders@printpro.com', 
        phone: '555-0100', 
        website: 'https://printpro.com',
        address: '123 Print Street',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90001',
        country: 'USA',
        is_active: true,
        notes: 'Primary vendor for business cards and flyers'
      },
      {
        name: 'QuickPrint Express',
        contact_email: 'support@quickprint.com',
        phone: '555-0200',
        website: 'https://quickprint.com',
        address: '456 Fast Lane',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        is_active: true,
        notes: 'Fast turnaround specialist'
      }
    ];

    console.log('🏢 Inserting vendors...');
    const { error: vendorError } = await supabase.from('vendors').upsert(vendors, { onConflict: 'name' });
    if (vendorError) console.error('Vendor error:', vendorError);
    else console.log('✅ Vendors inserted');

    // Insert paper stocks
    const paperStocks = [
      { name: '100lb Gloss Text', brand: 'Mohawk', weight: 100, finish: 'Gloss', color: 'White', description: 'Premium glossy text weight paper', price_per_sheet: 0.25, price_per_sq_inch: 0.00173611, weight_per_sq_inch: 0.0069444, is_active: true },
      { name: '80lb Matte Cover', brand: 'Neenah', weight: 80, finish: 'Matte', color: 'Natural', description: 'Smooth matte finish cover stock', price_per_sheet: 0.30, price_per_sq_inch: 0.00208333, weight_per_sq_inch: 0.0055556, is_active: true },
      { name: '14pt C2S', brand: 'International Paper', weight: 140, finish: 'Coated 2 Sides', color: 'White', description: 'Standard business card stock', price_per_sheet: 0.40, price_per_sq_inch: 0.00277778, weight_per_sq_inch: 0.0097222, is_active: true },
      { name: '16pt C2S', brand: 'Georgia Pacific', weight: 160, finish: 'Coated 2 Sides', color: 'White', description: 'Premium business card stock', price_per_sheet: 0.45, price_per_sq_inch: 0.00312500, weight_per_sq_inch: 0.0111111, is_active: true }
    ];

    console.log('📄 Inserting paper stocks...');
    const { error: paperError } = await supabase.from('paper_stocks').upsert(paperStocks, { onConflict: 'name' });
    if (paperError) console.error('Paper stock error:', paperError);
    else console.log('✅ Paper stocks inserted');

    // Insert turnaround times
    const turnaroundTimes = [
      { name: 'Standard (5-7 days)', business_days: 7, price_multiplier: 1.0, is_active: true, is_default: true, sort_order: 1 },
      { name: 'Rush (3-4 days)', business_days: 4, price_multiplier: 1.25, is_active: true, is_default: false, sort_order: 2 },
      { name: 'Express (2 days)', business_days: 2, price_multiplier: 1.5, is_active: true, is_default: false, sort_order: 3 },
      { name: 'Next Day', business_days: 1, price_multiplier: 2.0, is_active: true, is_default: false, sort_order: 4 }
    ];

    console.log('⏱️ Inserting turnaround times...');
    const { error: turnaroundError } = await supabase.from('turnaround_times').upsert(turnaroundTimes, { onConflict: 'name' });
    if (turnaroundError) console.error('Turnaround time error:', turnaroundError);
    else console.log('✅ Turnaround times inserted');

    // Insert print sizes
    const printSizes = [
      { name: 'Business Card (3.5" x 2")', width_inches: 3.5, height_inches: 2.0, is_active: true, sort_order: 1 },
      { name: 'Postcard (4" x 6")', width_inches: 4.0, height_inches: 6.0, is_active: true, sort_order: 2 },
      { name: 'Flyer (8.5" x 11")', width_inches: 8.5, height_inches: 11.0, is_active: true, sort_order: 3 },
      { name: 'Poster (11" x 17")', width_inches: 11.0, height_inches: 17.0, is_active: true, sort_order: 4 }
    ];

    console.log('📐 Inserting print sizes...');
    const { error: sizeError } = await supabase.from('print_sizes').upsert(printSizes, { onConflict: 'name' });
    if (sizeError) console.error('Print size error:', sizeError);
    else console.log('✅ Print sizes inserted');

    // Insert quantity groups
    const quantities = [
      { name: 'Small Print Runs', values: '25,50,100,250,500', default_value: 100, has_custom: false, is_active: true },
      { name: 'Standard Print Runs', values: '100,250,500,1000,2500,5000', default_value: 500, has_custom: false, is_active: true },
      { name: 'Business Card Quantities', values: '100,250,500,1000,2500,5000,custom', default_value: 500, has_custom: true, is_active: true }
    ];

    console.log('🔢 Inserting quantity groups...');
    const { error: qtyError } = await supabase.from('quantities').upsert(quantities, { onConflict: 'name' });
    if (qtyError) console.error('Quantity error:', qtyError);
    else console.log('✅ Quantity groups inserted');

    // Insert add-ons
    const addOns = [
      { name: 'Digital Proof', code: 'digital-proof', pricing_model: 'FLAT', base_price: 5.00, configuration: { description: 'PDF proof before printing' }, is_active: true, sort_order: 1 },
      { name: 'Our Tagline', code: 'our-tagline', pricing_model: 'FLAT', base_price: 0.00, configuration: { description: 'Add our company tagline' }, is_active: true, sort_order: 2 },
      { name: 'Perforation', code: 'perforation', pricing_model: 'SUB_OPTIONS', base_price: 0.00, configuration: { sub_options: [{ name: '1 line', price: 25 }, { name: '2 lines', price: 50 }, { name: '3 lines', price: 75 }] }, is_active: true, sort_order: 3 },
      { name: 'Folding', code: 'folding', pricing_model: 'SUB_OPTIONS', base_price: 0.00, configuration: { sub_options: [{ name: 'Half-fold', price: 30 }, { name: 'Tri-fold', price: 45 }, { name: 'Z-fold', price: 45 }] }, is_active: true, sort_order: 5 }
    ];

    console.log('➕ Inserting add-ons...');
    const { error: addOnError } = await supabase.from('add_ons').upsert(addOns, { onConflict: 'code' });
    if (addOnError) console.error('Add-on error:', addOnError);
    else console.log('✅ Add-ons inserted');

    console.log('\n🎉 Test data insertion complete!');
  } catch (error) {
    console.error('❌ Error in programmatic insertion:', error);
  }
}

// Run the insertion
insertTestData();