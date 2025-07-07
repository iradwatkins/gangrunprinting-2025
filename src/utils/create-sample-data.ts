import { supabase } from '@/integrations/supabase/client';
import { 
  paperStocksApi, 
  coatingsApi, 
  printSizesApi, 
  turnaroundTimesApi, 
  addOnsApi,
  quantitiesApi,
  sidesApi 
} from '@/api/global-options';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';
import { productsApi } from '@/api/products';
import type { TablesInsert } from '@/integrations/supabase/types';

export async function createSampleProduct() {
  console.log('🚀 Creating Club Flyers sample product...');
  
  try {
    // Step 1: Create Category
    console.log('📁 Creating category...');
    const categoryResponse = await categoriesApi.createCategory({
      name: 'Flyers & Postcards',
      slug: 'flyers-postcards', 
      description: 'High-quality custom flyers and postcards for marketing and events',
      is_active: true
    });
    
    if (categoryResponse.error) {
      throw new Error(`Category creation failed: ${categoryResponse.error}`);
    }
    const category = categoryResponse.data!;
    console.log('✅ Category created:', category.name);

    // Step 2: Create Vendor
    console.log('🏭 Creating vendor...');
    const vendorResponse = await vendorsApi.createVendor({
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
      incoming_email_addresses: ['orders@premiumprint.com'],
      is_active: true
    });

    if (vendorResponse.error) {
      throw new Error(`Vendor creation failed: ${vendorResponse.error}`);
    }
    const vendor = vendorResponse.data!;
    console.log('✅ Vendor created:', vendor.name);

    // Step 3: Create Paper Stocks
    console.log('📄 Creating paper stocks...');
    const paperStockData = [
      {
        name: '14pt Card Stock',
        weight: 300,
        price_per_sq_inch: 0.0085,
        description: 'Premium thick card stock, perfect for professional flyers',
        is_active: true
      },
      {
        name: '100lb Text Paper', 
        weight: 148,
        price_per_sq_inch: 0.0055,
        description: 'High-quality text paper, ideal for promotional flyers',
        is_active: true
      }
    ];

    const createdPaperStocks = [];
    for (const stock of paperStockData) {
      const response = await paperStocksApi.createPaperStock(stock);
      if (response.error) {
        console.warn(`Paper stock creation warning: ${response.error}`);
        continue;
      }
      createdPaperStocks.push(response.data!);
      console.log('✅ Paper stock created:', response.data!.name);
    }

    // Step 4: Create Coatings
    console.log('✨ Creating coatings...');
    const coatingData = [
      {
        name: 'High Gloss UV',
        price_modifier: 0.0000,
        description: 'High gloss UV coating for vibrant colors',
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
    for (const coating of coatingData) {
      const response = await coatingsApi.createCoating(coating);
      if (response.error) {
        console.warn(`Coating creation warning: ${response.error}`);
        continue;
      }
      createdCoatings.push(response.data!);
      console.log('✅ Coating created:', response.data!.name);
    }

    // Step 5: Create Print Sizes
    console.log('📏 Creating print sizes...');
    const printSizeData = [
      { name: '4" × 6"', width: 4.0, height: 6.0, is_active: true },
      { name: '5" × 7"', width: 5.0, height: 7.0, is_active: true },
      { name: '8.5" × 11"', width: 8.5, height: 11.0, is_active: true }
    ];

    const createdPrintSizes = [];
    for (const size of printSizeData) {
      const response = await printSizesApi.createPrintSize(size);
      if (response.error) {
        console.warn(`Print size creation warning: ${response.error}`);
        continue;
      }
      createdPrintSizes.push(response.data!);
      console.log('✅ Print size created:', response.data!.name);
    }

    // Step 6: Create Turnaround Times
    console.log('⏰ Creating turnaround times...');
    const turnaroundData = [
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
      }
    ];

    const createdTurnaroundTimes = [];
    for (const time of turnaroundData) {
      const response = await turnaroundTimesApi.createTurnaroundTime(time);
      if (response.error) {
        console.warn(`Turnaround time creation warning: ${response.error}`);
        continue;
      }
      createdTurnaroundTimes.push(response.data!);
      console.log('✅ Turnaround time created:', response.data!.name);
    }

    // Step 7: Create Add-ons
    console.log('🔧 Creating add-ons...');
    const addOnData = [
      {
        name: 'Digital Proof',
        pricing_model: 'flat' as const,
        configuration: { base_price: 5.00 },
        description: 'Digital proof for approval before printing',
        is_active: true
      },
      {
        name: 'Exact Size',
        pricing_model: 'percentage' as const,
        configuration: { markup_percentage: 12.5 },
        description: 'Cut to exact dimensions specified', 
        is_active: true
      }
    ];

    const createdAddOns = [];
    for (const addon of addOnData) {
      const response = await addOnsApi.createAddOn(addon);
      if (response.error) {
        console.warn(`Add-on creation warning: ${response.error}`);
        continue;
      }
      createdAddOns.push(response.data!);
      console.log('✅ Add-on created:', response.data!.name);
    }

    // Step 8: Create Quantities (if missing tables exist)
    console.log('📊 Creating quantities...');
    try {
      const quantities = [
        { name: '25', value: 25, is_custom: false, is_active: true },
        { name: '100', value: 100, is_custom: false, is_active: true },
        { name: '500', value: 500, is_custom: false, is_active: true }
      ];

      for (const qty of quantities) {
        const response = await quantitiesApi.createQuantity(qty);
        if (response.error) {
          console.warn(`Quantity creation warning: ${response.error}`);
          continue;
        }
        console.log('✅ Quantity created:', qty.name);
      }
    } catch (error) {
      console.warn('⚠️ Quantities table may not exist yet');
    }

    // Step 9: Create Sides (if missing tables exist)
    console.log('🔄 Creating sides...');
    try {
      const sidesData = [
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

      for (const side of sidesData) {
        const response = await sidesApi.createSide(side);
        if (response.error) {
          console.warn(`Side creation warning: ${response.error}`);
          continue;
        }
        console.log('✅ Side created:', side.name);
      }
    } catch (error) {
      console.warn('⚠️ Sides table may not exist yet');
    }

    // Step 10: Create the Product
    console.log('🎯 Creating Club Flyers product...');
    const productResponse = await productsApi.createProduct({
      name: 'Club Flyers',
      slug: 'club-flyers',
      description: 'High-impact club flyers perfect for promoting events, parties, and nightlife. Choose from multiple sizes, premium paper stocks, and professional finishes.',
      category_id: category.id,
      vendor_id: vendor.id,
      base_price: 0.15,
      minimum_quantity: 25,
      is_active: true
    });

    if (productResponse.error) {
      throw new Error(`Product creation failed: ${productResponse.error}`);
    }
    const product = productResponse.data!;
    console.log('✅ Product created:', product.name);

    // Step 11: Create Product Relationships (using direct API calls for now)
    console.log('🔗 Creating product relationships...');
    
    // Link paper stocks
    for (const stock of createdPaperStocks) {
      const { error } = await supabase
        .from('product_paper_stocks')
        .insert({
          product_id: product.id,
          paper_stock_id: stock.id,
          is_default: stock.name === '14pt Card Stock'
        });
      if (error) console.warn('Paper stock link warning:', error.message);
    }

    // Link print sizes
    for (const size of createdPrintSizes) {
      const { error } = await supabase
        .from('product_print_sizes') 
        .insert({
          product_id: product.id,
          print_size_id: size.id,
          is_default: size.name === '5" × 7"'
        });
      if (error) console.warn('Print size link warning:', error.message);
    }

    // Link turnaround times
    for (const time of createdTurnaroundTimes) {
      const { error } = await supabase
        .from('product_turnaround_times')
        .insert({
          product_id: product.id,
          turnaround_time_id: time.id,
          is_default: time.name === 'Standard'
        });
      if (error) console.warn('Turnaround time link warning:', error.message);
    }

    // Link add-ons
    for (const addon of createdAddOns) {
      const { error } = await supabase
        .from('product_add_ons')
        .insert({
          product_id: product.id,
          add_on_id: addon.id,
          is_mandatory: false
        });
      if (error) console.warn('Add-on link warning:', error.message);
    }

    console.log('\n🎉 SUCCESS! Club Flyers product created with:');
    console.log(`📦 Product: ${product.name}`);
    console.log(`📁 Category: ${category.name}`);
    console.log(`🏭 Vendor: ${vendor.name}`);
    console.log(`📄 Paper Stocks: ${createdPaperStocks.length} linked`);
    console.log(`✨ Coatings: ${createdCoatings.length} available`);
    console.log(`📏 Print Sizes: ${createdPrintSizes.length} linked`);
    console.log(`⏰ Turnaround Times: ${createdTurnaroundTimes.length} linked`);
    console.log(`🔧 Add-ons: ${createdAddOns.length} linked`);

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
    console.error('❌ Error creating sample product:', error);
    throw error;
  }
}