import { supabase } from '@/integrations/supabase/client';

interface InsertionResult {
  table: string;
  inserted: number;
  verified: number;
  data?: any[];
  error?: string;
}

export async function insertRealTestData() {
  const results: InsertionResult[] = [];
  const createdIds = {
    categories: {} as Record<string, string>,
    vendors: {} as Record<string, string>,
    paperStocks: {} as Record<string, string>,
    coatings: {} as Record<string, string>,
    turnaroundTimes: {} as Record<string, string>,
    printSizes: {} as Record<string, string>,
    quantities: {} as Record<string, string>,
    sides: {} as Record<string, string>,
    addOns: {} as Record<string, string>,
    products: {} as Record<string, string>,
  };

  console.log('🚀 Starting REAL test data insertion with correct table names...');
  console.log('📍 Supabase URL:', supabase.supabaseUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());

  // Helper function to insert and verify data
  async function insertAndVerify(tableName: string, data: any[], uniqueField: string = 'id'): Promise<InsertionResult> {
    console.log(`\n📝 Inserting ${data.length} records into ${tableName}...`);
    
    try {
      // Insert data
      const { data: inserted, error: insertError } = await supabase
        .from(tableName)
        .upsert(data, { onConflict: uniqueField === 'id' ? undefined : uniqueField })
        .select();

      if (insertError) {
        console.error(`❌ Error inserting into ${tableName}:`, insertError);
        return {
          table: tableName,
          inserted: 0,
          verified: 0,
          error: insertError.message
        };
      }

      console.log(`✅ Inserted ${inserted?.length || 0} records into ${tableName}`);

      // Verify by counting
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error(`❌ Error counting ${tableName}:`, countError);
      }

      return {
        table: tableName,
        inserted: inserted?.length || 0,
        verified: count || 0,
        data: inserted
      };
    } catch (error: any) {
      console.error(`❌ Fatal error with ${tableName}:`, error);
      return {
        table: tableName,
        inserted: 0,
        verified: 0,
        error: error.message
      };
    }
  }

  try {
    // 1. PRODUCT CATEGORIES
    console.log('\n━━━ 1. PRODUCT CATEGORIES ━━━');
    const categories = [
      { name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards for networking', is_active: true, sort_order: 1 },
      { name: 'Flyers', slug: 'flyers', description: 'Marketing flyers for promotions', is_active: true, sort_order: 2 },
      { name: 'Brochures', slug: 'brochures', description: 'Folded brochures for detailed information', is_active: true, sort_order: 3 },
      { name: 'Postcards', slug: 'postcards', description: 'Direct mail postcards', is_active: true, sort_order: 4 },
      { name: 'Posters', slug: 'posters', description: 'Large format posters', is_active: true, sort_order: 5 },
      { name: 'Banners', slug: 'banners', description: 'Vinyl and fabric banners', is_active: true, sort_order: 6 },
      { name: 'Stickers', slug: 'stickers', description: 'Custom stickers and labels', is_active: true, sort_order: 7 },
      { name: 'Letterheads', slug: 'letterheads', description: 'Professional letterheads', is_active: true, sort_order: 8 },
      { name: 'Envelopes', slug: 'envelopes', description: 'Custom printed envelopes', is_active: true, sort_order: 9 },
      { name: 'Presentation Folders', slug: 'presentation-folders', description: 'Professional folders', is_active: true, sort_order: 10 }
    ];

    const catResult = await insertAndVerify('product_categories', categories, 'slug');
    results.push(catResult);
    
    // Store IDs for later use
    if (catResult.data) {
      catResult.data.forEach(cat => {
        createdIds.categories[cat.slug] = cat.id;
      });
    }

    // 2. VENDORS
    console.log('\n━━━ 2. VENDORS ━━━');
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
      },
      {
        name: 'Premium Print Co',
        contact_email: 'hello@premiumprint.com',
        phone: '555-0300',
        website: 'https://premiumprint.com',
        address: '789 Quality Ave',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        is_active: true,
        notes: 'High-end printing services'
      }
    ];

    const vendorResult = await insertAndVerify('vendors', vendors, 'name');
    results.push(vendorResult);
    
    if (vendorResult.data) {
      vendorResult.data.forEach(vendor => {
        createdIds.vendors[vendor.name] = vendor.id;
      });
    }

    // 3. PAPER STOCKS
    console.log('\n━━━ 3. PAPER STOCKS ━━━');
    const paperStocks = [
      { name: '14pt Cardstock', weight: '14pt', finish: 'Matte', color: 'White', is_active: true, sort_order: 1 },
      { name: '16pt Cardstock', weight: '16pt', finish: 'Gloss', color: 'White', is_active: true, sort_order: 2 },
      { name: '100lb Text', weight: '100lb', finish: 'Uncoated', color: 'White', is_active: true, sort_order: 3 },
      { name: '80lb Cover', weight: '80lb', finish: 'Satin', color: 'White', is_active: true, sort_order: 4 },
      { name: 'Premium Linen', weight: '110lb', finish: 'Textured', color: 'Natural', is_active: true, sort_order: 5 },
      { name: 'Recycled Eco', weight: '14pt', finish: 'Matte', color: 'Natural', is_active: true, sort_order: 6 }
    ];

    const paperResult = await insertAndVerify('paper_stocks', paperStocks, 'name');
    results.push(paperResult);
    
    if (paperResult.data) {
      paperResult.data.forEach(paper => {
        createdIds.paperStocks[paper.name] = paper.id;
      });
    }

    // 4. COATINGS
    console.log('\n━━━ 4. COATINGS ━━━');
    const coatings = [
      { name: 'None', description: 'No coating', price_multiplier: 1.0, is_active: true, sort_order: 1 },
      { name: 'UV Coating', description: 'High gloss UV coating', price_multiplier: 1.15, is_active: true, sort_order: 2 },
      { name: 'Matte Coating', description: 'Smooth matte finish', price_multiplier: 1.10, is_active: true, sort_order: 3 },
      { name: 'Soft Touch', description: 'Velvet-like soft touch coating', price_multiplier: 1.25, is_active: true, sort_order: 4 },
      { name: 'Spot UV', description: 'Selective UV coating', price_multiplier: 1.30, is_active: true, sort_order: 5 }
    ];

    const coatingResult = await insertAndVerify('coatings', coatings, 'name');
    results.push(coatingResult);
    
    if (coatingResult.data) {
      coatingResult.data.forEach(coating => {
        createdIds.coatings[coating.name] = coating.id;
      });
    }

    // 5. TURNAROUND TIMES
    console.log('\n━━━ 5. TURNAROUND TIMES ━━━');
    const turnaroundTimes = [
      { name: 'Standard (5-7 days)', days: 7, price_multiplier: 1.0, is_rush: false, is_active: true, sort_order: 1 },
      { name: 'Express (3-4 days)', days: 4, price_multiplier: 1.25, is_rush: false, is_active: true, sort_order: 2 },
      { name: 'Rush (2 days)', days: 2, price_multiplier: 1.50, is_rush: true, is_active: true, sort_order: 3 },
      { name: 'Next Day', days: 1, price_multiplier: 2.0, is_rush: true, is_active: true, sort_order: 4 },
      { name: 'Same Day', days: 0, price_multiplier: 3.0, is_rush: true, is_active: true, sort_order: 5 }
    ];

    const turnaroundResult = await insertAndVerify('turnaround_times', turnaroundTimes, 'name');
    results.push(turnaroundResult);
    
    if (turnaroundResult.data) {
      turnaroundResult.data.forEach(tt => {
        createdIds.turnaroundTimes[tt.name] = tt.id;
      });
    }

    // 6. PRINT SIZES
    console.log('\n━━━ 6. PRINT SIZES ━━━');
    const printSizes = [
      { name: 'Standard Business Card', width: 3.5, height: 2, unit: 'inches', is_active: true, sort_order: 1 },
      { name: 'Square Business Card', width: 2.5, height: 2.5, unit: 'inches', is_active: true, sort_order: 2 },
      { name: '4x6 Postcard', width: 6, height: 4, unit: 'inches', is_active: true, sort_order: 3 },
      { name: '5x7 Postcard', width: 7, height: 5, unit: 'inches', is_active: true, sort_order: 4 },
      { name: '8.5x11 Flyer', width: 8.5, height: 11, unit: 'inches', is_active: true, sort_order: 5 },
      { name: '11x17 Poster', width: 11, height: 17, unit: 'inches', is_active: true, sort_order: 6 },
      { name: '18x24 Poster', width: 18, height: 24, unit: 'inches', is_active: true, sort_order: 7 },
      { name: '24x36 Poster', width: 24, height: 36, unit: 'inches', is_active: true, sort_order: 8 }
    ];

    const sizeResult = await insertAndVerify('print_sizes', printSizes, 'name');
    results.push(sizeResult);
    
    if (sizeResult.data) {
      sizeResult.data.forEach(size => {
        createdIds.printSizes[size.name] = size.id;
      });
    }

    // 7. QUANTITIES (Quantity Groups)
    console.log('\n━━━ 7. QUANTITIES (Quantity Groups) ━━━');
    const quantities = [
      { 
        name: 'Standard Quantities',
        values: JSON.stringify([25, 50, 100, 250, 500, 1000]),
        default_value: 500,
        has_custom: false,
        is_active: true
      },
      { 
        name: 'Large Format Quantities',
        values: JSON.stringify([100, 250, 500, 1000, 2500, 5000, 10000]),
        default_value: 1000,
        has_custom: true,
        is_active: true
      },
      { 
        name: 'Small Run Quantities',
        values: JSON.stringify([10, 25, 50, 100]),
        default_value: 50,
        has_custom: false,
        is_active: true
      }
    ];

    const qtyResult = await insertAndVerify('quantities', quantities, 'name');
    results.push(qtyResult);
    
    if (qtyResult.data) {
      qtyResult.data.forEach(qty => {
        createdIds.quantities[qty.name] = qty.id;
      });
    }

    // 8. SIDES
    console.log('\n━━━ 8. SIDES ━━━');
    const sides = [
      { name: 'Single Sided (4/0)', multiplier: 1.0, tooltip_text: 'Full color front, blank back', is_active: true },
      { name: 'Double Sided (4/4)', multiplier: 1.6, tooltip_text: 'Full color both sides', is_active: true },
      { name: 'Front Color, Back B&W (4/1)', multiplier: 1.3, tooltip_text: 'Full color front, black & white back', is_active: true },
      { name: 'Black & White (1/0)', multiplier: 0.7, tooltip_text: 'Black & white front only', is_active: true },
      { name: 'Black & White Both Sides (1/1)', multiplier: 1.0, tooltip_text: 'Black & white both sides', is_active: true }
    ];

    const sidesResult = await insertAndVerify('sides', sides, 'name');
    results.push(sidesResult);
    
    if (sidesResult.data) {
      sidesResult.data.forEach(side => {
        createdIds.sides[side.name] = side.id;
      });
    }

    // 9. ADD-ONS
    console.log('\n━━━ 9. ADD-ONS ━━━');
    const addOns = [
      { 
        name: 'Rounded Corners', 
        description: 'Round corners for a softer look', 
        base_price: 0.05, 
        price_type: 'per_piece',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 1,
        has_sub_options: false
      },
      { 
        name: 'Foil Stamping', 
        description: 'Metallic foil accents', 
        base_price: 0.25, 
        price_type: 'per_piece',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 2,
        has_sub_options: true
      },
      { 
        name: 'Embossing', 
        description: 'Raised text or design', 
        base_price: 0.20, 
        price_type: 'per_piece',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 3,
        has_sub_options: false
      },
      { 
        name: 'Die Cutting', 
        description: 'Custom shape cutting', 
        base_price: 50.00, 
        price_type: 'flat_fee',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 4,
        has_sub_options: false
      },
      { 
        name: 'Perforation', 
        description: 'Add tear-away perforations', 
        base_price: 25.00, 
        price_type: 'flat_fee',
        is_percentage: false,
        percentage_value: null,
        is_active: true, 
        sort_order: 5,
        has_sub_options: true
      },
      { 
        name: 'Rush Service', 
        description: 'Priority production', 
        base_price: 0, 
        price_type: 'percentage',
        is_percentage: true,
        percentage_value: 50,
        is_active: true, 
        sort_order: 6,
        has_sub_options: false
      }
    ];

    const addOnResult = await insertAndVerify('add_ons', addOns, 'name');
    results.push(addOnResult);
    
    if (addOnResult.data) {
      addOnResult.data.forEach(addon => {
        createdIds.addOns[addon.name] = addon.id;
      });
    }

    // 10. PRODUCTS - Now we have all the required data
    console.log('\n━━━ 10. PRODUCTS ━━━');
    const products = [
      {
        name: 'Standard Business Cards',
        slug: 'standard-business-cards',
        description: 'Premium quality business cards perfect for networking and professional use',
        base_price: 39.99,
        category_id: createdIds.categories['business-cards'],
        vendor_id: Object.values(createdIds.vendors)[0],
        is_featured: true,
        is_active: true,
        setup_fee: 0,
        min_quantity: 100,
        max_quantity: 10000,
        meta_title: 'Premium Business Cards | Professional Printing',
        meta_description: 'High-quality business cards with fast turnaround. Multiple paper options and finishes available.'
      },
      {
        name: 'Marketing Flyers',
        slug: 'marketing-flyers',
        description: 'Eye-catching flyers for promoting your business, events, or special offers',
        base_price: 89.99,
        category_id: createdIds.categories['flyers'],
        vendor_id: Object.values(createdIds.vendors)[1],
        is_featured: true,
        is_active: true,
        setup_fee: 0,
        min_quantity: 100,
        max_quantity: 50000,
        meta_title: 'Custom Flyers | Marketing Materials',
        meta_description: 'Professional flyer printing with vibrant colors and premium paper options.'
      },
      {
        name: 'Tri-Fold Brochures',
        slug: 'tri-fold-brochures',
        description: 'Professional tri-fold brochures for detailed product or service information',
        base_price: 149.99,
        category_id: createdIds.categories['brochures'],
        vendor_id: Object.values(createdIds.vendors)[2],
        is_featured: false,
        is_active: true,
        setup_fee: 25,
        min_quantity: 250,
        max_quantity: 25000,
        meta_title: 'Tri-Fold Brochures | Professional Printing',
        meta_description: 'Custom tri-fold brochures with full-color printing and multiple folding options.'
      },
      {
        name: 'Direct Mail Postcards',
        slug: 'direct-mail-postcards',
        description: 'High-impact postcards for direct mail marketing campaigns',
        base_price: 79.99,
        category_id: createdIds.categories['postcards'],
        vendor_id: Object.values(createdIds.vendors)[0],
        is_featured: true,
        is_active: true,
        setup_fee: 0,
        min_quantity: 500,
        max_quantity: 100000,
        meta_title: 'Direct Mail Postcards | Marketing Solutions',
        meta_description: 'Professional postcard printing for direct mail campaigns. EDDM services available.'
      }
    ];

    const productResult = await insertAndVerify('products', products, 'slug');
    results.push(productResult);
    
    if (productResult.data) {
      productResult.data.forEach(product => {
        createdIds.products[product.slug] = product.id;
      });
    }

    // 11. LINK PRODUCTS TO OPTIONS (Junction Tables)
    console.log('\n━━━ 11. LINKING PRODUCTS TO OPTIONS ━━━');
    
    // Link all products to all paper stocks
    const productPaperStocks = [];
    for (const productId of Object.values(createdIds.products)) {
      for (const paperStockId of Object.values(createdIds.paperStocks)) {
        productPaperStocks.push({
          product_id: productId,
          paper_stock_id: paperStockId,
          is_default: productPaperStocks.length === 0 // First one is default
        });
      }
    }
    const ppResult = await insertAndVerify('product_paper_stocks', productPaperStocks);
    results.push(ppResult);

    // Link all products to all print sizes (based on category)
    const productPrintSizes = [];
    if (createdIds.products['standard-business-cards']) {
      productPrintSizes.push(
        { product_id: createdIds.products['standard-business-cards'], print_size_id: createdIds.printSizes['Standard Business Card'], is_default: true },
        { product_id: createdIds.products['standard-business-cards'], print_size_id: createdIds.printSizes['Square Business Card'], is_default: false }
      );
    }
    if (createdIds.products['marketing-flyers']) {
      productPrintSizes.push(
        { product_id: createdIds.products['marketing-flyers'], print_size_id: createdIds.printSizes['8.5x11 Flyer'], is_default: true }
      );
    }
    if (createdIds.products['direct-mail-postcards']) {
      productPrintSizes.push(
        { product_id: createdIds.products['direct-mail-postcards'], print_size_id: createdIds.printSizes['4x6 Postcard'], is_default: true },
        { product_id: createdIds.products['direct-mail-postcards'], print_size_id: createdIds.printSizes['5x7 Postcard'], is_default: false }
      );
    }
    const psResult = await insertAndVerify('product_print_sizes', productPrintSizes);
    results.push(psResult);

    // Link all products to all turnaround times
    const productTurnaroundTimes = [];
    for (const productId of Object.values(createdIds.products)) {
      let isFirst = true;
      for (const turnaroundId of Object.values(createdIds.turnaroundTimes)) {
        productTurnaroundTimes.push({
          product_id: productId,
          turnaround_time_id: turnaroundId,
          is_default: isFirst
        });
        isFirst = false;
      }
    }
    const pttResult = await insertAndVerify('product_turnaround_times', productTurnaroundTimes);
    results.push(pttResult);

    // Note: No product_quantities, product_sides, or product_coatings junction tables exist
    console.log('\n━━━ NOTE: No junction tables for quantities, sides, or coatings ━━━');

    // Link products to add-ons
    const productAddOns = [];
    for (const productId of Object.values(createdIds.products)) {
      // Add some add-ons to each product
      productAddOns.push(
        { product_id: productId, add_on_id: createdIds.addOns['Rounded Corners'], is_popular: true },
        { product_id: productId, add_on_id: createdIds.addOns['Rush Service'], is_popular: false }
      );
    }
    const paResult = await insertAndVerify('product_add_ons', productAddOns);
    results.push(paResult);

    // 12. FINAL SUMMARY
    console.log('\n\n🎉 ━━━ TEST DATA INSERTION COMPLETE ━━━ 🎉');
    console.log('\n📊 SUMMARY:');
    
    let totalInserted = 0;
    let totalVerified = 0;
    let errors = 0;
    
    results.forEach(result => {
      totalInserted += result.inserted;
      totalVerified += result.verified;
      if (result.error) errors++;
      
      const status = result.error ? '❌' : '✅';
      console.log(`${status} ${result.table}: ${result.inserted} inserted, ${result.verified} total in database`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 TOTALS: ${totalInserted} records inserted, ${totalVerified} total records verified`);
    console.log(`${errors > 0 ? '⚠️' : '✅'} Errors: ${errors}`);

    // Return structured results
    return {
      success: errors === 0,
      results,
      summary: {
        totalInserted,
        totalVerified,
        errors
      }
    };

  } catch (error: any) {
    console.error('❌ Fatal error during insertion:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).insertRealTestData = insertRealTestData;
  console.log('💡 Test data function available: insertRealTestData()');
}