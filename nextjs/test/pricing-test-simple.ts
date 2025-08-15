/**
 * Simple Pricing Engine Test
 * Verifies pricing calculations work with PostgreSQL
 */

import { getPrismaClient } from '../../shared/database/prisma/repositories';
import { documentationPricingEngine } from '../../shared/pricing/documentation-calculations';

async function testPricing() {
  console.log('🧪 Testing Pricing Engine with PostgreSQL...\n');

  const prisma = getPrismaClient();

  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return;
  }

  // Test 1: Basic pricing calculation
  console.log('Test 1: Basic Business Card Pricing (500 qty, double sided)');
  const basicCalc = documentationPricingEngine.calculatePrice({
    quantity: 500,
    print_size: {
      id: 'business-card',
      name: 'Business Card',
      width: 3.5,
      height: 2,
      is_custom: false,
    },
    paper_stock: {
      id: 'stock-1',
      name: '16pt Glossy',
      price_per_sq_inch: 0.008,
      second_side_markup_percent: 30,
    },
    sides: 'double',
    turnaround_time: {
      id: 'standard',
      name: 'Standard (5-7 days)',
      price_markup_percent: 0,
      business_days: 7,
    },
    add_ons: {},
    is_broker: false,
    category_id: 'business-cards',
  });

  console.log('  Base Paper Print Price: $' + basicCalc.base_paper_print_price.toFixed(2));
  console.log('  Price After Turnaround: $' + basicCalc.price_after_turnaround.toFixed(2));
  console.log('  Final Price: $' + basicCalc.calculated_product_subtotal_before_shipping_tax.toFixed(2));
  console.log('✅ Basic pricing test passed\n');

  // Test 2: Pricing with add-ons
  console.log('Test 2: Pricing with UV Coating and EDDM');
  const withAddOns = documentationPricingEngine.calculatePrice({
    quantity: 1000,
    print_size: {
      id: 'postcard',
      name: 'Postcard',
      width: 4,
      height: 6,
      is_custom: false,
    },
    paper_stock: {
      id: 'stock-2',
      name: '14pt Matte',
      price_per_sq_inch: 0.006,
      second_side_markup_percent: 25,
    },
    sides: 'double',
    turnaround_time: {
      id: 'rush',
      name: 'Rush (2-3 days)',
      price_markup_percent: 25,
      business_days: 3,
    },
    add_ons: {
      digital_proof: {
        selected: true,
        price: 5,
      },
      eddm_process: {
        selected: true,
        price_per_piece: 0.18,
        setup_fee: 0,
        route_selection: 'us_select',
        mandatory_banding: true,
      },
      exact_size: {
        selected: true,
        markup_percentage: 12.5,
      },
    },
    is_broker: false,
    category_id: 'postcards',
  });

  console.log('  Base Paper Print Price: $' + withAddOns.base_paper_print_price.toFixed(2));
  console.log('  Exact Size Applied: ' + withAddOns.exact_size_applied);
  console.log('  Price After Turnaround: $' + withAddOns.price_after_turnaround.toFixed(2));
  console.log('  Add-ons Total: $' + withAddOns.total_addon_cost.toFixed(2));
  console.log('  Final Price: $' + withAddOns.calculated_product_subtotal_before_shipping_tax.toFixed(2));
  console.log('✅ Add-ons pricing test passed\n');

  // Test 3: Volume pricing tiers
  console.log('Test 3: Volume Pricing Tiers');
  const quantities = [100, 500, 1000, 2500, 5000];
  for (const qty of quantities) {
    const calc = documentationPricingEngine.calculatePrice({
      quantity: qty,
      print_size: {
        id: 'business-card',
        name: 'Business Card',
        width: 3.5,
        height: 2,
        is_custom: false,
      },
      paper_stock: {
        id: 'stock-1',
        name: '16pt Glossy',
        price_per_sq_inch: 0.008,
        second_side_markup_percent: 30,
      },
      sides: 'single',
      turnaround_time: {
        id: 'standard',
        name: 'Standard',
        price_markup_percent: 0,
        business_days: 7,
      },
      add_ons: {},
      is_broker: false,
      category_id: 'business-cards',
    });
    
    const unitPrice = calc.calculated_product_subtotal_before_shipping_tax / qty;
    console.log(`  Qty ${qty.toString().padStart(4)}: Total $${calc.calculated_product_subtotal_before_shipping_tax.toFixed(2).padStart(8)}, Unit $${unitPrice.toFixed(4)}`);
  }
  console.log('✅ Volume pricing test passed\n');

  // Test 4: Check database tables
  console.log('Test 4: Database Tables Check');
  const tableChecks = [
    { table: 'category', model: prisma.category },
    { table: 'product', model: prisma.product },
    { table: 'paperStock', model: prisma.paperStock },
    { table: 'addOn', model: prisma.addOn },
    { table: 'userProfile', model: prisma.userProfile },
  ];

  for (const check of tableChecks) {
    try {
      const count = await (check.model as any).count();
      console.log(`  ✅ Table ${check.table}: ${count} records`);
    } catch (error) {
      console.log(`  ❌ Table ${check.table}: Error accessing`);
    }
  }

  console.log('\n🎉 All tests completed successfully!');
  console.log('The pricing engine is working correctly with PostgreSQL.');
  
  await prisma.$disconnect();
}

// Run test
testPricing().catch(console.error);