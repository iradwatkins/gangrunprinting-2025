import { supabase } from '@/integrations/supabase/client';

export async function insertTestData() {
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
      },
      {
        name: 'Premium Print Co',
        contact_email: 'hello@premiumprint.com',
        phone: '555-0300',
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
      { name: '16pt C2S', weight: 160, finish: 'Coated 2 Sides', color: 'White', is_active: true },
      { name: '100lb Silk Text', weight: 100, finish: 'Silk', color: 'White', is_active: true },
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
      { name: 'Next Day', business_days: 1, price_multiplier: 2.0, is_active: true, is_default: false },
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
      { name: 'Postcard (5" x 7")', width_inches: 5.0, height_inches: 7.0, is_active: true },
      { name: 'Flyer (8.5" x 11")', width_inches: 8.5, height_inches: 11.0, is_active: true },
      { name: 'Flyer (5.5" x 8.5")', width_inches: 5.5, height_inches: 8.5, is_active: true },
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
      { name: 'Business Card Quantities', values: '100,250,500,1000,2500,5000,custom', default_value: 500, has_custom: true, is_active: true },
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
      { name: 'Digital Proof', code: 'digital-proof', pricing_model: 'FLAT', base_price: 5.00, configuration: { description: 'PDF proof before printing' }, is_active: true, sort_order: 1 },
      { name: 'Our Tagline', code: 'our-tagline', pricing_model: 'FLAT', base_price: 0.00, configuration: { description: 'Add our company tagline' }, is_active: true, sort_order: 2 },
      { name: 'Perforation', code: 'perforation', pricing_model: 'SUB_OPTIONS', base_price: 0.00, configuration: { sub_options: [{ name: '1 line', price: 25 }, { name: '2 lines', price: 50 }] }, is_active: true, sort_order: 3 },
      { name: 'Folding', code: 'folding', pricing_model: 'SUB_OPTIONS', base_price: 0.00, configuration: { sub_options: [{ name: 'Half-fold', price: 30 }, { name: 'Tri-fold', price: 45 }] }, is_active: true, sort_order: 5 },
      { name: 'Design Service', code: 'design', pricing_model: 'TIERED', base_price: 0.00, configuration: { tiers: [{ min: 0, max: 999999, price: 150 }] }, is_active: true, sort_order: 6 },
    ];

    console.log('➕ Inserting add-ons...');
    const { data: addOnData, error: addOnError } = await supabase.from('add_ons').upsert(addOns, { onConflict: 'code' }).select();
    if (addOnError) {
      console.error('Add-on error:', addOnError);
    } else {
      console.log('✅ Add-ons inserted:', addOnData?.length);
    }

    console.log('\n🎉 Test data insertion complete!');
    console.log('✅ You can now visit the admin pages to see the data');
    
    return { success: true, message: 'Test data inserted successfully' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error };
  }
}

// Make function available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).insertTestData = insertTestData;
}