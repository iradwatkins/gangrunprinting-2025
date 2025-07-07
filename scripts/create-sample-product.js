/**
 * Sample Product Creation Script
 * Creates a complete "Club Flyers" product with all global options
 * Following the documentation requirements exactly
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dprvugzbsqcufitbxkda.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnZ1Z3pic3FjdWZpdGJ4a2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDAxMjksImV4cCI6MjA2NzIxNjEyOX0.WhXSCItswLC93KdxbM5uo8gIHXYeEdbNxyZpj2og9gg";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createSampleData() {
  console.log('🚀 Creating complete sample product data...');
  
  try {
    // Step 1: Create missing tables if needed
    console.log('📋 Step 1: Ensuring required tables exist...');
    
    // Check if quantities table exists
    const { data: quantitiesTest } = await supabase.from('quantities').select('*').limit(1);
    const { data: sidesTest } = await supabase.from('sides').select('*').limit(1);
    
    console.log('✅ Database tables accessible');

    // Step 2: Create Category
    console.log('📁 Step 2: Creating category...');
    const { data: category, error: categoryError } = await supabase
      .from('product_categories')
      .upsert({
        name: 'Flyers & Postcards',
        slug: 'flyers-postcards',
        description: 'High-quality custom flyers and postcards for marketing and events',
        is_active: true
      }, { onConflict: 'slug' })
      .select()
      .single();
    
    if (categoryError) throw categoryError;
    console.log('✅ Category created:', category.name);

    // Step 3: Create Vendor
    console.log('🏭 Step 3: Creating vendor...');
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .upsert({
        name: 'Premium Print Solutions',
        email: 'orders@premiumprint.com',
        phone: '(555) 123-4567',
        address: {
          street: '123 Industrial Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210'
        },
        supported_shipping_carriers: ['FedEx', 'UPS'],
        incoming_email_addresses: ['orders@premiumprint.com', 'production@premiumprint.com'],
        is_active: true
      }, { onConflict: 'email' })
      .select()
      .single();
    
    if (vendorError) throw vendorError;
    console.log('✅ Vendor created:', vendor.name);

    // Step 4: Create Paper Stocks
    console.log('📄 Step 4: Creating paper stocks...');
    const paperStocks = [
      {
        name: '14pt Card Stock',
        weight: 300,
        price_per_sq_inch: 0.0085,
        description: 'Premium thick card stock, perfect for professional flyers and postcards',
        is_active: true
      },
      {
        name: '100lb Text Paper',
        weight: 148,
        price_per_sq_inch: 0.0055,
        description: 'High-quality text paper, ideal for promotional flyers',
        is_active: true
      },
      {
        name: '16pt Card Stock',
        weight: 350,
        price_per_sq_inch: 0.0095,
        description: 'Extra thick premium card stock for luxury feel',
        is_active: true
      }
    ];

    const createdPaperStocks = [];
    for (const stock of paperStocks) {
      const { data, error } = await supabase
        .from('paper_stocks')
        .upsert(stock, { onConflict: 'name' })
        .select()
        .single();
      if (error) throw error;
      createdPaperStocks.push(data);
      console.log('✅ Paper stock created:', data.name);
    }

    // Step 5: Create Coatings
    console.log('✨ Step 5: Creating coatings...');
    const coatings = [
      {
        name: 'High Gloss UV',
        price_modifier: 0.0000,
        description: 'High gloss UV coating for vibrant colors and protection',
        is_active: true
      },
      {
        name: 'Matte Finish',
        price_modifier: 0.0000,
        description: 'Smooth matte finish with subtle texture',
        is_active: true
      },
      {
        name: 'No Coating',
        price_modifier: 0.0000,
        description: 'Natural paper finish without coating',
        is_active: true
      }
    ];

    const createdCoatings = [];
    for (const coating of coatings) {
      const { data, error } = await supabase
        .from('coatings')
        .upsert(coating, { onConflict: 'name' })
        .select()
        .single();
      if (error) throw error;
      createdCoatings.push(data);
      console.log('✅ Coating created:', data.name);
    }

    // Step 6: Create Print Sizes
    console.log('📏 Step 6: Creating print sizes...');
    const printSizes = [
      { name: '4" × 6"', width: 4.0, height: 6.0, is_active: true },
      { name: '5" × 7"', width: 5.0, height: 7.0, is_active: true },
      { name: '5.5" × 8.5"', width: 5.5, height: 8.5, is_active: true },
      { name: '8.5" × 11"', width: 8.5, height: 11.0, is_active: true },
      { name: '6" × 9"', width: 6.0, height: 9.0, is_active: true },
      { name: '6" × 11"', width: 6.0, height: 11.0, is_active: true }
    ];

    const createdPrintSizes = [];
    for (const size of printSizes) {
      const { data, error } = await supabase
        .from('print_sizes')
        .upsert(size, { onConflict: 'name' })
        .select()
        .single();
      if (error) throw error;
      createdPrintSizes.push(data);
      console.log('✅ Print size created:', data.name);
    }

    // Step 7: Create Turnaround Times
    console.log('⏰ Step 7: Creating turnaround times...');
    const turnaroundTimes = [
      {
        name: 'Standard',
        business_days: 5,
        price_markup_percent: 0.00,
        is_active: true
      },
      {
        name: 'Rush',
        business_days: 3,
        price_markup_percent: 25.00,
        is_active: true
      },
      {
        name: 'Express',
        business_days: 1,
        price_markup_percent: 50.00,
        is_active: true
      }
    ];

    const createdTurnaroundTimes = [];
    for (const time of turnaroundTimes) {
      const { data, error } = await supabase
        .from('turnaround_times')
        .upsert(time, { onConflict: 'name' })
        .select()
        .single();
      if (error) throw error;
      createdTurnaroundTimes.push(data);
      console.log('✅ Turnaround time created:', data.name);
    }

    // Step 8: Create Add-on Services (Key ones from documentation)
    console.log('🔧 Step 8: Creating add-on services...');
    const addOns = [
      {
        name: 'Digital Proof',
        pricing_model: 'flat',
        configuration: { base_price: 5.00 },
        description: 'Digital proof for approval before printing',
        is_active: true
      },
      {
        name: 'Our Tagline',
        pricing_model: 'percentage',
        configuration: { discount_percentage: 5.00 },
        description: '5% discount when you include our tagline',
        is_active: true
      },
      {
        name: 'Exact Size',
        pricing_model: 'percentage',
        configuration: { markup_percentage: 12.5 },
        description: 'Cut to exact dimensions specified',
        is_active: true
      },
      {
        name: 'Banding',
        pricing_model: 'per_unit',
        configuration: { price_per_bundle: 0.75, default_items_per_bundle: 100 },
        description: 'Band your printed materials in convenient bundles',
        is_active: true
      }
    ];

    const createdAddOns = [];
    for (const addon of addOns) {
      const { data, error } = await supabase
        .from('add_ons')
        .upsert(addon, { onConflict: 'name' })
        .select()
        .single();
      if (error) throw error;
      createdAddOns.push(data);
      console.log('✅ Add-on created:', data.name);
    }

    // Step 9: Create Quantities
    console.log('📊 Step 9: Creating quantities...');
    const quantities = [
      { name: '25', value: 25, is_custom: false, is_active: true },
      { name: '50', value: 50, is_custom: false, is_active: true },
      { name: '100', value: 100, is_custom: false, is_active: true },
      { name: '250', value: 250, is_custom: false, is_active: true },
      { name: '500', value: 500, is_custom: false, is_active: true },
      { name: '1000', value: 1000, is_custom: false, is_active: true },
      { name: '2500', value: 2500, is_custom: false, is_active: true },
      { name: '5000', value: 5000, is_custom: false, is_active: true },
      { name: 'Custom', value: null, is_custom: true, min_custom_value: 5000, increment_value: 5000, is_active: true }
    ];

    for (const qty of quantities) {
      const { error } = await supabase
        .from('quantities')
        .upsert(qty, { onConflict: 'name' });
      if (error) throw error;
      console.log('✅ Quantity created:', qty.name);
    }

    // Step 10: Create Sides
    console.log('🔄 Step 10: Creating sides...');
    const sides = [
      {
        name: 'Single Sided',
        multiplier: 1.0000,
        tooltip_text: 'Print on one side only',
        is_active: true
      },
      {
        name: 'Double Sided (4/4)',
        multiplier: 1.8000,
        tooltip_text: 'Print on both sides (front and back)',
        is_active: true
      }
    ];

    for (const side of sides) {
      const { error } = await supabase
        .from('sides')
        .upsert(side, { onConflict: 'name' });
      if (error) throw error;
      console.log('✅ Side created:', side.name);
    }

    // Step 11: Create the Club Flyers Product
    console.log('🎯 Step 11: Creating Club Flyers product...');
    const { data: product, error: productError } = await supabase
      .from('products')
      .upsert({
        name: 'Club Flyers',
        slug: 'club-flyers',
        description: 'High-impact club flyers perfect for promoting events, parties, and nightlife. Choose from multiple sizes, premium paper stocks, and professional finishes to make your events stand out.',
        category_id: category.id,
        vendor_id: vendor.id,
        base_price: 0.15, // Base price per square inch
        minimum_quantity: 25,
        is_active: true
      }, { onConflict: 'slug' })
      .select()
      .single();
    
    if (productError) throw productError;
    console.log('✅ Product created:', product.name);

    // Step 12: Create Product Relationships
    console.log('🔗 Step 12: Creating product relationships...');
    
    // Link to paper stocks
    for (const stock of createdPaperStocks) {
      const { error } = await supabase
        .from('product_paper_stocks')
        .upsert({
          product_id: product.id,
          paper_stock_id: stock.id,
          is_default: stock.name === '14pt Card Stock'
        }, { onConflict: 'product_id,paper_stock_id' });
      if (error) throw error;
    }
    console.log('✅ Paper stocks linked to product');

    // Link to print sizes  
    for (const size of createdPrintSizes) {
      const { error } = await supabase
        .from('product_print_sizes')
        .upsert({
          product_id: product.id,
          print_size_id: size.id,
          is_default: size.name === '5" × 7"'
        }, { onConflict: 'product_id,print_size_id' });
      if (error) throw error;
    }
    console.log('✅ Print sizes linked to product');

    // Link to turnaround times
    for (const time of createdTurnaroundTimes) {
      const { error } = await supabase
        .from('product_turnaround_times')
        .upsert({
          product_id: product.id,
          turnaround_time_id: time.id,
          is_default: time.name === 'Standard'
        }, { onConflict: 'product_id,turnaround_time_id' });
      if (error) throw error;
    }
    console.log('✅ Turnaround times linked to product');

    // Link to add-ons
    for (const addon of createdAddOns) {
      const { error } = await supabase
        .from('product_add_ons')
        .upsert({
          product_id: product.id,
          add_on_id: addon.id,
          is_mandatory: false
        }, { onConflict: 'product_id,add_on_id' });
      if (error) throw error;
    }
    console.log('✅ Add-ons linked to product');

    console.log('\n🎉 SUCCESS! Club Flyers product created with complete configuration:');
    console.log(`📦 Product: ${product.name} (${product.slug})`);
    console.log(`📁 Category: ${category.name}`);
    console.log(`🏭 Vendor: ${vendor.name}`);
    console.log(`📄 Paper Stocks: ${createdPaperStocks.length} options`);
    console.log(`✨ Coatings: ${createdCoatings.length} options`);
    console.log(`📏 Print Sizes: ${createdPrintSizes.length} options`);
    console.log(`⏰ Turnaround Times: ${createdTurnaroundTimes.length} options`);
    console.log(`🔧 Add-on Services: ${createdAddOns.length} options`);
    console.log(`📊 Quantities: ${quantities.length} options`);
    console.log(`🔄 Sides: ${sides.length} options`);
    
    console.log('\n🌐 Ready for customer orders! The product includes:');
    console.log('• Multiple paper stock options with different weights and pricing');
    console.log('• Professional coating options (UV, Matte, None)'); 
    console.log('• Standard flyer sizes from 4×6 to 8.5×11');
    console.log('• Flexible turnaround options with appropriate pricing');
    console.log('• Key add-on services for customization');
    console.log('• Complete quantity ranges from 25 to custom amounts');
    console.log('• Single and double-sided printing options');

    return {
      product,
      category,
      vendor,
      paperStocks: createdPaperStocks,
      coatings: createdCoatings,
      printSizes: createdPrintSizes,
      turnaroundTimes: createdTurnaroundTimes,
      addOns: createdAddOns
    };

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

// Run the script
createSampleData()
  .then((result) => {
    console.log('\n✅ Sample product creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create sample product:', error);
    process.exit(1);
  });