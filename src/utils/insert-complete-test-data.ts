import { supabase } from '@/integrations/supabase/client';

interface InsertionResult {
  table: string;
  inserted: number;
  verified: number;
  data?: any[];
  error?: string;
}

export async function insertCompleteTestData() {
  const results: InsertionResult[] = [];
  const createdIds = {
    categories: {} as Record<string, string>,
    vendors: {} as Record<string, string>,
    paperStocks: {} as Record<string, string>,
    coatings: {} as Record<string, string>,
    turnaroundTimes: {} as Record<string, string>,
    printSizes: {} as Record<string, string>,
    quantities: {} as Record<string, string>,
    addOns: {} as Record<string, string>,
    products: {} as Record<string, string>,
  };

  console.log('🚀 Starting COMPLETE test data insertion...');
  console.log('📍 Supabase URL:', supabase.supabaseUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    // 1. PRODUCT CATEGORIES
    console.log('\n━━━ 1. PRODUCT CATEGORIES ━━━');
    const categories = [
      { name: 'Business Cards', slug: 'business-cards', description: 'Professional business cards for networking and branding', is_active: true, sort_order: 1 },
      { name: 'Flyers', slug: 'flyers', description: 'Marketing flyers for promotions and events', is_active: true, sort_order: 2 },
      { name: 'Brochures', slug: 'brochures', description: 'Folded brochures for detailed product information', is_active: true, sort_order: 3 },
      { name: 'Postcards', slug: 'postcards', description: 'Direct mail postcards for marketing campaigns', is_active: true, sort_order: 4 },
      { name: 'Posters', slug: 'posters', description: 'Large format posters for advertising', is_active: true, sort_order: 5 },
      { name: 'Banners', slug: 'banners', description: 'Vinyl and fabric banners for events', is_active: true, sort_order: 6 },
      { name: 'Stickers', slug: 'stickers', description: 'Custom stickers and labels', is_active: true, sort_order: 7 },
      { name: 'Letterheads', slug: 'letterheads', description: 'Professional letterheads for correspondence', is_active: true, sort_order: 8 },
      { name: 'Envelopes', slug: 'envelopes', description: 'Custom printed envelopes', is_active: true, sort_order: 9 },
      { name: 'Presentation Folders', slug: 'presentation-folders', description: 'Professional folders for presentations', is_active: true, sort_order: 10 }
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
      },
      {
        name: 'EcoPrint Green',
        contact_email: 'info@ecoprint.com',
        phone: '555-0400',
        is_active: true,
        notes: 'Sustainable printing options'
      }
    ];

    const vendorResult = await insertAndVerify('vendors', vendors, 'name');
    results.push(vendorResult);
    
    if (vendorResult.data) {
      vendorResult.data.forEach(vendor => {
        createdIds.vendors[vendor.name] = vendor.id;
      });
    }

    // 3. COATINGS
    console.log('\n━━━ 3. COATINGS ━━━');
    const coatings = [
      { name: 'No Coating', code: 'none', description: 'Uncoated finish', is_active: true },
      { name: 'Matte', code: 'matte', description: 'Non-reflective matte finish', is_active: true },
      { name: 'Gloss', code: 'gloss', description: 'High-gloss reflective finish', is_active: true },
      { name: 'Soft Touch', code: 'soft-touch', description: 'Velvet-like soft touch coating', is_active: true },
      { name: 'UV Coating', code: 'uv', description: 'Ultra-glossy UV coating', is_active: true },
      { name: 'Aqueous', code: 'aqueous', description: 'Water-based protective coating', is_active: true }
    ];

    const coatingResult = await insertAndVerify('coatings', coatings, 'code');
    results.push(coatingResult);
    
    if (coatingResult.data) {
      coatingResult.data.forEach(coating => {
        createdIds.coatings[coating.code] = coating.id;
      });
    }

    // 4. PAPER STOCKS
    console.log('\n━━━ 4. PAPER STOCKS ━━━');
    const paperStocks = [
      { name: '14pt C2S', brand: 'International Paper', weight: 14, finish: 'Coated 2 Sides', color: 'White', description: 'Standard business card stock', price_per_sheet: 0.08, price_per_sq_inch: 0.00055556, weight_per_sq_inch: 0.0097222, is_active: true },
      { name: '16pt C2S', brand: 'Georgia Pacific', weight: 16, finish: 'Coated 2 Sides', color: 'White', description: 'Premium business card stock', price_per_sheet: 0.10, price_per_sq_inch: 0.00069444, weight_per_sq_inch: 0.0111111, is_active: true },
      { name: '32pt Triple Layer', brand: 'Mohawk', weight: 32, finish: 'Uncoated', color: 'White', description: 'Ultra-thick luxury stock', price_per_sheet: 0.25, price_per_sq_inch: 0.00173611, weight_per_sq_inch: 0.0222222, is_active: true },
      { name: '100lb Gloss Text', brand: 'Sappi', weight: 100, finish: 'Gloss', color: 'White', description: 'Glossy text weight paper', price_per_sheet: 0.15, price_per_sq_inch: 0.00104167, weight_per_sq_inch: 0.0069444, is_active: true },
      { name: '100lb Matte Text', brand: 'Neenah', weight: 100, finish: 'Matte', color: 'White', description: 'Matte text weight paper', price_per_sheet: 0.15, price_per_sq_inch: 0.00104167, weight_per_sq_inch: 0.0069444, is_active: true },
      { name: '80lb Gloss Cover', brand: 'Domtar', weight: 80, finish: 'Gloss', color: 'White', description: 'Glossy cover stock', price_per_sheet: 0.20, price_per_sq_inch: 0.00138889, weight_per_sq_inch: 0.0055556, is_active: true },
      { name: '80lb Matte Cover', brand: 'Neenah', weight: 80, finish: 'Matte', color: 'Natural', description: 'Matte cover stock', price_per_sheet: 0.20, price_per_sq_inch: 0.00138889, weight_per_sq_inch: 0.0055556, is_active: true },
      { name: '70lb Uncoated Text', brand: 'Domtar', weight: 70, finish: 'Uncoated', color: 'White', description: 'Standard uncoated paper', price_per_sheet: 0.12, price_per_sq_inch: 0.00083333, weight_per_sq_inch: 0.0048611, is_active: true },
      { name: '24lb Bond', brand: 'Hammermill', weight: 24, finish: 'Uncoated', color: 'White', description: 'Standard office paper', price_per_sheet: 0.05, price_per_sq_inch: 0.00034722, weight_per_sq_inch: 0.0016667, is_active: true },
      { name: '130lb Dull Cover', brand: 'Sappi', weight: 130, finish: 'Dull', color: 'White', description: 'Dull coated cover stock', price_per_sheet: 0.22, price_per_sq_inch: 0.00152778, weight_per_sq_inch: 0.0090278, is_active: true }
    ];

    const paperResult = await insertAndVerify('paper_stocks', paperStocks, 'name');
    results.push(paperResult);
    
    if (paperResult.data) {
      paperResult.data.forEach(paper => {
        createdIds.paperStocks[paper.name] = paper.id;
      });
    }

    // 5. LINK PAPER STOCKS TO COATINGS
    console.log('\n━━━ 5. PAPER STOCK COATINGS ━━━');
    const paperCoatingLinks = [];
    
    // Link appropriate coatings to paper stocks
    const coatedPapers = ['14pt C2S', '16pt C2S', '100lb Gloss Text', '80lb Gloss Cover'];
    const uncoatedPapers = ['32pt Triple Layer', '70lb Uncoated Text', '24lb Bond'];
    
    for (const paperName of coatedPapers) {
      const paperId = createdIds.paperStocks[paperName];
      if (paperId) {
        for (const coatingCode of ['none', 'matte', 'gloss', 'uv', 'aqueous']) {
          const coatingId = createdIds.coatings[coatingCode];
          if (coatingId) {
            paperCoatingLinks.push({
              paper_stock_id: paperId,
              coating_id: coatingId,
              is_default: coatingCode === 'gloss'
            });
          }
        }
      }
    }

    if (paperCoatingLinks.length > 0) {
      const { error } = await supabase.from('paper_stock_coatings').upsert(paperCoatingLinks);
      if (error) console.error('Paper coating link error:', error);
      else console.log(`✅ Linked ${paperCoatingLinks.length} paper-coating combinations`);
    }

    // 6. TURNAROUND TIMES
    console.log('\n━━━ 6. TURNAROUND TIMES ━━━');
    const turnaroundTimes = [
      { name: 'Standard (5-7 days)', business_days: 7, price_multiplier: 1.0, is_active: true, is_default: true, sort_order: 1 },
      { name: 'Rush (3-4 days)', business_days: 4, price_multiplier: 1.25, is_active: true, is_default: false, sort_order: 2 },
      { name: 'Express (2 days)', business_days: 2, price_multiplier: 1.5, is_active: true, is_default: false, sort_order: 3 },
      { name: 'Next Day', business_days: 1, price_multiplier: 2.0, is_active: true, is_default: false, sort_order: 4 },
      { name: 'Same Day', business_days: 0, price_multiplier: 3.0, is_active: true, is_default: false, sort_order: 5 }
    ];

    const turnaroundResult = await insertAndVerify('turnaround_times', turnaroundTimes, 'name');
    results.push(turnaroundResult);
    
    if (turnaroundResult.data) {
      turnaroundResult.data.forEach(tt => {
        createdIds.turnaroundTimes[tt.name] = tt.id;
      });
    }

    // 7. PRINT SIZES
    console.log('\n━━━ 7. PRINT SIZES ━━━');
    const printSizes = [
      // Business Cards
      { name: 'Standard Business Card (3.5" x 2")', width_inches: 3.5, height_inches: 2.0, is_active: true, sort_order: 1 },
      { name: 'Square Business Card (2.5" x 2.5")', width_inches: 2.5, height_inches: 2.5, is_active: true, sort_order: 2 },
      { name: 'Mini Business Card (3.5" x 1")', width_inches: 3.5, height_inches: 1.0, is_active: true, sort_order: 3 },
      
      // Postcards
      { name: 'Postcard 4" x 6"', width_inches: 4.0, height_inches: 6.0, is_active: true, sort_order: 4 },
      { name: 'Postcard 5" x 7"', width_inches: 5.0, height_inches: 7.0, is_active: true, sort_order: 5 },
      { name: 'Postcard 6" x 9"', width_inches: 6.0, height_inches: 9.0, is_active: true, sort_order: 6 },
      
      // Flyers
      { name: 'Half Page Flyer (5.5" x 8.5")', width_inches: 5.5, height_inches: 8.5, is_active: true, sort_order: 7 },
      { name: 'Letter Flyer (8.5" x 11")', width_inches: 8.5, height_inches: 11.0, is_active: true, sort_order: 8 },
      { name: 'Legal Flyer (8.5" x 14")', width_inches: 8.5, height_inches: 14.0, is_active: true, sort_order: 9 },
      
      // Posters
      { name: 'Small Poster (11" x 17")', width_inches: 11.0, height_inches: 17.0, is_active: true, sort_order: 10 },
      { name: 'Medium Poster (18" x 24")', width_inches: 18.0, height_inches: 24.0, is_active: true, sort_order: 11 },
      { name: 'Large Poster (24" x 36")', width_inches: 24.0, height_inches: 36.0, is_active: true, sort_order: 12 },
      
      // Banners
      { name: 'Small Banner (2\' x 4\')', width_inches: 24.0, height_inches: 48.0, is_active: true, sort_order: 13 },
      { name: 'Medium Banner (3\' x 6\')', width_inches: 36.0, height_inches: 72.0, is_active: true, sort_order: 14 },
      { name: 'Large Banner (4\' x 8\')', width_inches: 48.0, height_inches: 96.0, is_active: true, sort_order: 15 }
    ];

    const sizeResult = await insertAndVerify('print_sizes', printSizes, 'name');
    results.push(sizeResult);
    
    if (sizeResult.data) {
      sizeResult.data.forEach(size => {
        createdIds.printSizes[size.name] = size.id;
      });
    }

    // 8. QUANTITY GROUPS
    console.log('\n━━━ 8. QUANTITY GROUPS ━━━');
    const quantities = [
      { name: 'Business Card Quantities', values: '100,250,500,1000,2500,5000,10000,custom', default_value: 500, has_custom: true, is_active: true },
      { name: 'Flyer Quantities', values: '25,50,100,250,500,1000,2500,5000', default_value: 100, has_custom: false, is_active: true },
      { name: 'Postcard Quantities', values: '50,100,250,500,1000,2500,5000,10000', default_value: 500, has_custom: false, is_active: true },
      { name: 'Brochure Quantities', values: '25,50,100,250,500,1000', default_value: 100, has_custom: false, is_active: true },
      { name: 'Poster Quantities', values: '1,5,10,25,50,100,250', default_value: 10, has_custom: false, is_active: true },
      { name: 'Sticker Quantities', values: '50,100,250,500,1000,2500,custom', default_value: 250, has_custom: true, is_active: true },
      { name: 'Banner Quantities', values: '1,2,3,5,10,custom', default_value: 1, has_custom: true, is_active: true }
    ];

    const qtyResult = await insertAndVerify('quantities', quantities, 'name');
    results.push(qtyResult);
    
    if (qtyResult.data) {
      qtyResult.data.forEach(qty => {
        createdIds.quantities[qty.name] = qty.id;
      });
    }

    // 9. ADD-ONS (All 13 from documentation)
    console.log('\n━━━ 9. ADD-ONS ━━━');
    const addOns = [
      { 
        name: 'Digital Proof', 
        code: 'digital-proof', 
        pricing_model: 'FLAT' as const, 
        base_price: 5.00, 
        configuration: { description: 'PDF proof before printing', tooltip: 'Get a digital proof to review before we print' }, 
        is_active: true, 
        sort_order: 1 
      },
      { 
        name: 'Our Tagline', 
        code: 'our-tagline', 
        pricing_model: 'FLAT' as const, 
        base_price: 0.00, 
        configuration: { description: 'Add our company tagline to your design', tooltip: 'Small tagline added to bottom of design' }, 
        is_active: true, 
        sort_order: 2 
      },
      { 
        name: 'Perforation', 
        code: 'perforation', 
        pricing_model: 'SUB_OPTIONS' as const, 
        base_price: 0.00, 
        configuration: { 
          description: 'Add perforation lines',
          tooltip: 'Create tear-away sections',
          sub_options: [
            { name: '1 line', price: 25 }, 
            { name: '2 lines', price: 50 }, 
            { name: '3 lines', price: 75 }
          ] 
        }, 
        is_active: true, 
        sort_order: 3 
      },
      { 
        name: 'Score Only', 
        code: 'score-only', 
        pricing_model: 'SUB_OPTIONS' as const, 
        base_price: 0.00, 
        configuration: { 
          description: 'Add score lines for folding',
          tooltip: 'Score lines make folding easier and cleaner',
          sub_options: [
            { name: '1 score', price: 20 }, 
            { name: '2 scores', price: 40 },
            { name: '3 scores', price: 60 }
          ] 
        }, 
        is_active: true, 
        sort_order: 4 
      },
      { 
        name: 'Folding', 
        code: 'folding', 
        pricing_model: 'SUB_OPTIONS' as const, 
        base_price: 0.00, 
        configuration: { 
          description: 'Professional folding service',
          tooltip: 'We fold your prints for you',
          sub_options: [
            { name: 'Half-fold', price: 30 }, 
            { name: 'Tri-fold', price: 45 }, 
            { name: 'Z-fold', price: 45 },
            { name: 'Gate-fold', price: 60 }
          ] 
        }, 
        is_active: true, 
        sort_order: 5 
      },
      { 
        name: 'Design', 
        code: 'design', 
        pricing_model: 'TIERED' as const, 
        base_price: 0.00, 
        configuration: { 
          description: 'Professional design service',
          tooltip: 'Let our designers create your artwork',
          tiers: [
            { min: 0, max: 999999, price: 150 }
          ] 
        }, 
        is_active: true, 
        sort_order: 6 
      },
      { 
        name: 'Exact Size', 
        code: 'exact-size', 
        pricing_model: 'FLAT' as const, 
        base_price: 15.00, 
        configuration: { 
          description: 'Custom size cutting',
          tooltip: 'Cut to your exact specifications',
          requires_2nd_side_markup: true
        }, 
        is_active: true, 
        sort_order: 7 
      },
      { 
        name: 'Banding', 
        code: 'banding', 
        pricing_model: 'FLAT' as const, 
        base_price: 10.00, 
        configuration: { 
          description: 'Bundle with paper bands',
          tooltip: 'Keep stacks organized with paper bands'
        }, 
        is_active: true, 
        sort_order: 8 
      },
      { 
        name: 'Shrink Wrapping', 
        code: 'shrink-wrapping', 
        pricing_model: 'FLAT' as const, 
        base_price: 20.00, 
        configuration: { 
          description: 'Shrink wrap bundles',
          tooltip: 'Protect prints with shrink wrap'
        }, 
        is_active: true, 
        sort_order: 9 
      },
      { 
        name: 'QR Code', 
        code: 'qr-code', 
        pricing_model: 'FLAT' as const, 
        base_price: 25.00, 
        configuration: { 
          description: 'Add QR code to design',
          tooltip: 'Link to website, contact info, or other data'
        }, 
        is_active: true, 
        sort_order: 10 
      },
      { 
        name: 'Postal Delivery', 
        code: 'postal-delivery', 
        pricing_model: 'PERCENTAGE' as const, 
        base_price: 15.00, 
        configuration: { 
          description: 'Direct mail delivery',
          tooltip: 'We handle the mailing for you',
          percentage: true
        }, 
        is_active: true, 
        sort_order: 11 
      },
      { 
        name: 'EDDM Process', 
        code: 'eddm-process', 
        pricing_model: 'FLAT' as const, 
        base_price: 150.00, 
        configuration: { 
          description: 'Every Door Direct Mail processing',
          tooltip: 'USPS EDDM service for targeted mailing',
          requires: ['banding']
        }, 
        is_active: true, 
        sort_order: 12 
      },
      { 
        name: 'Hole Drilling', 
        code: 'hole-drilling', 
        pricing_model: 'SUB_OPTIONS' as const, 
        base_price: 0.00, 
        configuration: { 
          description: 'Add holes for hanging or binding',
          tooltip: 'Precision hole drilling',
          sub_options: [
            { name: '1 hole', price: 15 }, 
            { name: '2 holes', price: 25 }, 
            { name: '3 holes', price: 35 }
          ] 
        }, 
        is_active: true, 
        sort_order: 13 
      }
    ];

    const addOnResult = await insertAndVerify('add_ons', addOns, 'code');
    results.push(addOnResult);
    
    if (addOnResult.data) {
      addOnResult.data.forEach(addon => {
        createdIds.addOns[addon.code] = addon.id;
      });
    }

    // 10. PRODUCTS
    console.log('\n━━━ 10. PRODUCTS ━━━');
    const products = [
      // Business Cards
      {
        name: 'Standard Business Cards',
        slug: 'standard-business-cards',
        description: 'Professional 16pt business cards with full color printing on both sides',
        category_id: createdIds.categories['business-cards'],
        vendor_id: createdIds.vendors['PrintPro Solutions'],
        base_price: 39.99,
        setup_fee: 0.00,
        minimum_quantity: 100,
        is_active: true
      },
      {
        name: 'Premium Business Cards',
        slug: 'premium-business-cards',
        description: 'Luxury 32pt triple-layer business cards with special finishes',
        category_id: createdIds.categories['business-cards'],
        vendor_id: createdIds.vendors['Premium Print Co'],
        base_price: 89.99,
        setup_fee: 25.00,
        minimum_quantity: 100,
        is_active: true
      },
      {
        name: 'Economy Business Cards',
        slug: 'economy-business-cards',
        description: 'Budget-friendly 14pt business cards',
        category_id: createdIds.categories['business-cards'],
        vendor_id: createdIds.vendors['QuickPrint Express'],
        base_price: 24.99,
        setup_fee: 0.00,
        minimum_quantity: 250,
        is_active: true
      },
      
      // Flyers
      {
        name: 'Standard Flyers',
        slug: 'standard-flyers',
        description: 'Full color flyers on premium paper stock',
        category_id: createdIds.categories['flyers'],
        vendor_id: createdIds.vendors['QuickPrint Express'],
        base_price: 89.99,
        setup_fee: 0.00,
        minimum_quantity: 100,
        is_active: true
      },
      {
        name: 'Premium Flyers',
        slug: 'premium-flyers',
        description: 'High-quality flyers with coating options',
        category_id: createdIds.categories['flyers'],
        vendor_id: createdIds.vendors['PrintPro Solutions'],
        base_price: 149.99,
        setup_fee: 0.00,
        minimum_quantity: 100,
        is_active: true
      },
      
      // Postcards
      {
        name: 'Marketing Postcards',
        slug: 'marketing-postcards',
        description: 'Direct mail postcards with EDDM options',
        category_id: createdIds.categories['postcards'],
        vendor_id: createdIds.vendors['PrintPro Solutions'],
        base_price: 79.99,
        setup_fee: 0.00,
        minimum_quantity: 100,
        is_active: true
      },
      
      // Brochures
      {
        name: 'Tri-Fold Brochures',
        slug: 'tri-fold-brochures',
        description: 'Professional tri-fold brochures with full color printing',
        category_id: createdIds.categories['brochures'],
        vendor_id: createdIds.vendors['Premium Print Co'],
        base_price: 199.99,
        setup_fee: 0.00,
        minimum_quantity: 100,
        is_active: true
      },
      
      // Posters
      {
        name: 'Event Posters',
        slug: 'event-posters',
        description: 'Eye-catching posters for events and promotions',
        category_id: createdIds.categories['posters'],
        vendor_id: createdIds.vendors['QuickPrint Express'],
        base_price: 29.99,
        setup_fee: 0.00,
        minimum_quantity: 1,
        is_active: true
      },
      
      // Banners
      {
        name: 'Vinyl Banners',
        slug: 'vinyl-banners',
        description: 'Durable vinyl banners for indoor and outdoor use',
        category_id: createdIds.categories['banners'],
        vendor_id: createdIds.vendors['PrintPro Solutions'],
        base_price: 89.99,
        setup_fee: 25.00,
        minimum_quantity: 1,
        is_active: true
      },
      
      // Stickers
      {
        name: 'Custom Stickers',
        slug: 'custom-stickers',
        description: 'Die-cut stickers in any shape and size',
        category_id: createdIds.categories['stickers'],
        vendor_id: createdIds.vendors['EcoPrint Green'],
        base_price: 49.99,
        setup_fee: 15.00,
        minimum_quantity: 50,
        is_active: true
      }
    ];

    const productResult = await insertAndVerify('products', products, 'slug');
    results.push(productResult);
    
    if (productResult.data) {
      productResult.data.forEach(product => {
        createdIds.products[product.slug] = product.id;
      });
    }

    // 11. LINK PRODUCTS TO OPTIONS
    console.log('\n━━━ 11. PRODUCT CONFIGURATIONS ━━━');
    
    // Link Business Cards to appropriate options
    const businessCardProducts = ['standard-business-cards', 'premium-business-cards', 'economy-business-cards'];
    for (const productSlug of businessCardProducts) {
      const productId = createdIds.products[productSlug];
      if (!productId) continue;

      // Link paper stocks
      const paperStockLinks = [];
      const bcPapers = productSlug === 'premium-business-cards' 
        ? ['32pt Triple Layer', '16pt C2S'] 
        : ['14pt C2S', '16pt C2S'];
      
      for (const paperName of bcPapers) {
        const paperId = createdIds.paperStocks[paperName];
        if (paperId) {
          paperStockLinks.push({
            product_id: productId,
            paper_stock_id: paperId,
            is_default: paperName === '16pt C2S',
            price_adjustment: 0
          });
        }
      }
      
      if (paperStockLinks.length > 0) {
        await supabase.from('product_paper_stocks').upsert(paperStockLinks);
      }

      // Link print sizes
      const sizeLinks = [];
      const bcSizes = ['Standard Business Card (3.5" x 2")', 'Square Business Card (2.5" x 2.5")'];
      for (const sizeName of bcSizes) {
        const sizeId = createdIds.printSizes[sizeName];
        if (sizeId) {
          sizeLinks.push({
            product_id: productId,
            print_size_id: sizeId,
            is_default: sizeName.includes('Standard'),
            price_adjustment: sizeName.includes('Square') ? 10 : 0
          });
        }
      }
      
      if (sizeLinks.length > 0) {
        await supabase.from('product_print_sizes').upsert(sizeLinks);
      }

      // Link turnaround times
      const turnaroundLinks = [];
      for (const ttName in createdIds.turnaroundTimes) {
        turnaroundLinks.push({
          product_id: productId,
          turnaround_time_id: createdIds.turnaroundTimes[ttName],
          is_default: ttName.includes('Standard')
        });
      }
      
      if (turnaroundLinks.length > 0) {
        await supabase.from('product_turnaround_times').upsert(turnaroundLinks);
      }

      // Link quantities
      const qtyId = createdIds.quantities['Business Card Quantities'];
      if (qtyId) {
        await supabase.from('product_quantities').upsert([{
          product_id: productId,
          quantity_group_id: qtyId
        }]);
      }

      // Link add-ons
      const addOnLinks = [];
      const bcAddOns = ['digital-proof', 'our-tagline', 'exact-size', 'design', 'qr-code'];
      for (const addOnCode of bcAddOns) {
        const addOnId = createdIds.addOns[addOnCode];
        if (addOnId) {
          addOnLinks.push({
            product_id: productId,
            add_on_id: addOnId,
            is_mandatory: false,
            price_override: null
          });
        }
      }
      
      if (addOnLinks.length > 0) {
        await supabase.from('product_add_ons').upsert(addOnLinks);
      }
    }

    console.log(`✅ Configured ${businessCardProducts.length} business card products`);

    // 12. FINAL VERIFICATION
    console.log('\n━━━ 12. FINAL VERIFICATION ━━━');
    const counts = await getTableCounts();
    console.log('📊 Final Database Counts:', counts);

    // Summary
    console.log('\n🎉 COMPLETE TEST DATA INSERTION FINISHED!');
    console.log('📋 Summary:');
    results.forEach(result => {
      console.log(`   ${result.table}: ${result.inserted} inserted, ${result.verified} verified`);
    });

    return {
      success: true,
      results,
      counts,
      createdIds
    };

  } catch (error) {
    console.error('❌ Fatal error during insertion:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}

// Helper function to insert and verify data
async function insertAndVerify(
  table: string, 
  data: any[], 
  conflictColumn: string
): Promise<InsertionResult> {
  console.log(`Inserting ${data.length} records...`);
  
  const { data: inserted, error } = await supabase
    .from(table)
    .upsert(data, { onConflict: conflictColumn })
    .select();

  if (error) {
    console.error(`❌ ${table} error:`, error);
    return {
      table,
      inserted: 0,
      verified: 0,
      error: error.message
    };
  }

  console.log(`✅ Inserted ${inserted?.length || 0} records`);

  // Verify by querying back
  const { data: verified, error: verifyError } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(data.length * 2);

  if (verifyError) {
    console.error(`❌ ${table} verify error:`, verifyError);
  } else {
    console.log(`✅ Verified ${verified?.length || 0} records from database`);
  }

  return {
    table,
    inserted: inserted?.length || 0,
    verified: verified?.length || 0,
    data: inserted
  };
}

// Helper function to get table counts
async function getTableCounts() {
  const tables = [
    'product_categories',
    'vendors',
    'paper_stocks',
    'coatings',
    'turnaround_times',
    'print_sizes',
    'quantities',
    'add_ons',
    'products'
  ];

  const counts: Record<string, number> = {};

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    counts[table] = count || 0;
  }

  return counts;
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).insertCompleteTestData = insertCompleteTestData;
}