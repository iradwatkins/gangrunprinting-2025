import { createClient } from '@supabase/supabase-js';

// Get environment variables directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://akvyuzbopmswpiuklcyr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdnl1emJvcG1zd3BpdWtsY3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzODMzNDcsImV4cCI6MjA0NTk1OTM0N30.yxEGaLi7nBBtp2xCQatLfvULgA4zCUEHhwmM5fUGr-k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestData() {
  try {
    console.log('🚀 Starting test data insertion...');

    // Insert categories
    const categories = [
      { name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards for networking and branding', is_active: true, sort_order: 1 },
      { name: 'Flyers', slug: 'flyers', description: 'Marketing flyers for promotions and events', is_active: true, sort_order: 2 },
      { name: 'Brochures', slug: 'brochures', description: 'Folded brochures for detailed product information', is_active: true, sort_order: 3 },
      { name: 'Postcards', slug: 'postcards', description: 'Direct mail postcards for marketing campaigns', is_active: true, sort_order: 4 },
      { name: 'Banners', slug: 'banners', description: 'Large format banners for events and displays', is_active: true, sort_order: 5 },
    ];

    console.log('📁 Inserting categories...');
    const { data: catData, error: catError } = await supabase.from('product_categories').upsert(categories, { onConflict: 'slug' }).select();
    if (catError) {
      console.error('Category error:', catError);
    } else {
      console.log('✅ Categories inserted:', catData?.length);
    }

    // Insert vendors
    const vendors = [
      { 
        name: 'PrintPro Solutions', 
        contact_email: 'orders@printpro.com', 
        phone: '555-0100', 
        is_active: true,
      },
      {
        name: 'QuickPrint Express',
        contact_email: 'support@quickprint.com',
        phone: '555-0200',
        is_active: true,
      }
    ];

    console.log('🏢 Inserting vendors...');
    const { data: vendorData, error: vendorError } = await supabase.from('vendors').upsert(vendors, { onConflict: 'name' }).select();
    if (vendorError) {
      console.error('Vendor error:', vendorError);
    } else {
      console.log('✅ Vendors inserted:', vendorData?.length);
    }

    // Insert paper stocks
    const paperStocks = [
      { name: '100lb Gloss Text', weight: 100, finish: 'Gloss', color: 'White', is_active: true },
      { name: '80lb Matte Cover', weight: 80, finish: 'Matte', color: 'Natural', is_active: true },
      { name: '14pt C2S', weight: 140, finish: 'Coated 2 Sides', color: 'White', is_active: true },
      { name: '16pt C2S', weight: 160, finish: 'Coated 2 Sides', color: 'White', is_active: true }
    ];

    console.log('📄 Inserting paper stocks...');
    const { data: paperData, error: paperError } = await supabase.from('paper_stocks').upsert(paperStocks, { onConflict: 'name' }).select();
    if (paperError) {
      console.error('Paper stock error:', paperError);
    } else {
      console.log('✅ Paper stocks inserted:', paperData?.length);
    }

    // Insert turnaround times
    const turnaroundTimes = [
      { name: 'Standard (5-7 days)', business_days: 7, price_multiplier: 1.0, is_active: true, is_default: true },
      { name: 'Rush (3-4 days)', business_days: 4, price_multiplier: 1.25, is_active: true, is_default: false },
      { name: 'Express (2 days)', business_days: 2, price_multiplier: 1.5, is_active: true, is_default: false },
    ];

    console.log('⏱️ Inserting turnaround times...');
    const { data: turnaroundData, error: turnaroundError } = await supabase.from('turnaround_times').upsert(turnaroundTimes, { onConflict: 'name' }).select();
    if (turnaroundError) {
      console.error('Turnaround time error:', turnaroundError);
    } else {
      console.log('✅ Turnaround times inserted:', turnaroundData?.length);
    }

    // Insert print sizes
    const printSizes = [
      { name: 'Business Card (3.5" x 2")', width_inches: 3.5, height_inches: 2.0, is_active: true },
      { name: 'Postcard (4" x 6")', width_inches: 4.0, height_inches: 6.0, is_active: true },
      { name: 'Flyer (8.5" x 11")', width_inches: 8.5, height_inches: 11.0, is_active: true },
    ];

    console.log('📐 Inserting print sizes...');
    const { data: sizeData, error: sizeError } = await supabase.from('print_sizes').upsert(printSizes, { onConflict: 'name' }).select();
    if (sizeError) {
      console.error('Print size error:', sizeError);
    } else {
      console.log('✅ Print sizes inserted:', sizeData?.length);
    }

    // Insert quantity groups
    const quantities = [
      { name: 'Small Print Runs', values: '25,50,100,250,500', default_value: 100, has_custom: false, is_active: true },
      { name: 'Standard Print Runs', values: '100,250,500,1000,2500,5000', default_value: 500, has_custom: false, is_active: true },
    ];

    console.log('🔢 Inserting quantity groups...');
    const { data: qtyData, error: qtyError } = await supabase.from('quantities').upsert(quantities, { onConflict: 'name' }).select();
    if (qtyError) {
      console.error('Quantity error:', qtyError);
    } else {
      console.log('✅ Quantity groups inserted:', qtyData?.length);
    }

    // Insert add-ons
    const addOns = [
      { name: 'Digital Proof', code: 'digital-proof', pricing_model: 'FLAT', base_price: 5.00, configuration: { description: 'PDF proof before printing' }, is_active: true },
      { name: 'Our Tagline', code: 'our-tagline', pricing_model: 'FLAT', base_price: 0.00, configuration: { description: 'Add our company tagline' }, is_active: true },
      { name: 'Perforation', code: 'perforation', pricing_model: 'SUB_OPTIONS', base_price: 0.00, configuration: { sub_options: [{ name: '1 line', price: 25 }] }, is_active: true },
    ];

    console.log('➕ Inserting add-ons...');
    const { data: addOnData, error: addOnError } = await supabase.from('add_ons').upsert(addOns, { onConflict: 'code' }).select();
    if (addOnError) {
      console.error('Add-on error:', addOnError);
    } else {
      console.log('✅ Add-ons inserted:', addOnData?.length);
    }

    console.log('\n🎉 Test data insertion complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the insertion
insertTestData();