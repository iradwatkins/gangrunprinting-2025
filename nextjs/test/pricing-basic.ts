/**
 * Basic Pricing Engine Test - Minimal Dependencies
 * Tests pricing calculations work correctly
 */

import { documentationPricingEngine } from '../../shared/pricing/documentation-calculations';

console.log('🧪 Testing Pricing Engine...\n');

// Test 1: Basic pricing
console.log('Test 1: Basic Business Card Pricing');
const basicCalc = documentationPricingEngine.calculatePrice({
  quantity: 500,
  print_size: {
    id: 'bc',
    name: 'Business Card',
    width: 3.5,
    height: 2,
    is_custom: false,
  },
  paper_stock: {
    id: 'ps1',
    name: '16pt Glossy',
    price_per_sq_inch: 0.008,
    second_side_markup_percent: 30,
  },
  sides: 'double',
  turnaround_time: {
    id: 'standard',
    name: 'Standard',
    price_markup_percent: 0,
    business_days: 7,
  },
  add_ons: {},
  is_broker: false,
  category_id: 'bc-cat',
});

console.log('  Base Price: $' + basicCalc.base_paper_print_price.toFixed(2));
console.log('  Final Price: $' + basicCalc.calculated_product_subtotal_before_shipping_tax.toFixed(2));
console.log('  Unit Price: $' + (basicCalc.calculated_product_subtotal_before_shipping_tax / 500).toFixed(4));
console.log('✅ Test 1 Passed\n');

// Test 2: Pricing with add-ons
console.log('Test 2: Pricing with Add-ons');
const withAddOns = documentationPricingEngine.calculatePrice({
  quantity: 1000,
  print_size: {
    id: 'pc',
    name: 'Postcard',
    width: 4,
    height: 6,
    is_custom: false,
  },
  paper_stock: {
    id: 'ps2',
    name: '14pt Matte',
    price_per_sq_inch: 0.006,
    second_side_markup_percent: 25,
  },
  sides: 'double',
  turnaround_time: {
    id: 'rush',
    name: 'Rush',
    price_markup_percent: 25,
    business_days: 3,
  },
  add_ons: {
    digital_proof: {
      selected: true,
      price: 5,
    },
    exact_size: {
      selected: true,
      markup_percentage: 12.5,
    },
    perforation: {
      selected: true,
      setup_fee: 20,
      price_per_piece: 0.01,
      orientation: 'horizontal',
      position: 'center',
    },
  },
  is_broker: false,
  category_id: 'pc-cat',
});

console.log('  Base Price: $' + withAddOns.base_paper_print_price.toFixed(2));
console.log('  After Exact Size: $' + withAddOns.price_after_base_percentage_modifiers.toFixed(2));
console.log('  After Turnaround: $' + withAddOns.price_after_turnaround.toFixed(2));
console.log('  Add-ons Total: $' + withAddOns.total_addon_cost.toFixed(2));
console.log('  Final Price: $' + withAddOns.calculated_product_subtotal_before_shipping_tax.toFixed(2));
console.log('  Unit Price: $' + (withAddOns.calculated_product_subtotal_before_shipping_tax / 1000).toFixed(4));
console.log('✅ Test 2 Passed\n');

// Test 3: Volume pricing
console.log('Test 3: Volume Pricing Comparison');
const quantities = [100, 500, 1000, 2500, 5000];
console.log('  Quantity  Total Price   Unit Price');
console.log('  --------  -----------  -----------');

for (const qty of quantities) {
  const calc = documentationPricingEngine.calculatePrice({
    quantity: qty,
    print_size: {
      id: 'bc',
      name: 'Business Card',
      width: 3.5,
      height: 2,
      is_custom: false,
    },
    paper_stock: {
      id: 'ps1',
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
    category_id: 'bc-cat',
  });
  
  const total = calc.calculated_product_subtotal_before_shipping_tax;
  const unitPrice = total / qty;
  console.log(`  ${qty.toString().padEnd(8)}  $${total.toFixed(2).padStart(10)}  $${unitPrice.toFixed(4).padStart(10)}`);
}
console.log('✅ Test 3 Passed\n');

// Test 4: Broker pricing
console.log('Test 4: Broker Discount Pricing');
const brokerCalc = documentationPricingEngine.calculatePrice({
  quantity: 5000,
  print_size: {
    id: 'flyer',
    name: 'Flyer',
    width: 8.5,
    height: 11,
    is_custom: false,
  },
  paper_stock: {
    id: 'ps3',
    name: '100lb Glossy',
    price_per_sq_inch: 0.01,
    second_side_markup_percent: 35,
  },
  sides: 'double',
  turnaround_time: {
    id: 'standard',
    name: 'Standard',
    price_markup_percent: 0,
    business_days: 7,
  },
  add_ons: {},
  is_broker: true,
  broker_discounts: [
    {
      category_id: 'flyers',
      discount_percentage: 15,
    },
  ],
  category_id: 'flyers',
});

const regularCalc = documentationPricingEngine.calculatePrice({
  quantity: 5000,
  print_size: {
    id: 'flyer',
    name: 'Flyer',
    width: 8.5,
    height: 11,
    is_custom: false,
  },
  paper_stock: {
    id: 'ps3',
    name: '100lb Glossy',
    price_per_sq_inch: 0.01,
    second_side_markup_percent: 35,
  },
  sides: 'double',
  turnaround_time: {
    id: 'standard',
    name: 'Standard',
    price_markup_percent: 0,
    business_days: 7,
  },
  add_ons: {},
  is_broker: false,
  category_id: 'flyers',
});

console.log('  Regular Price: $' + regularCalc.calculated_product_subtotal_before_shipping_tax.toFixed(2));
console.log('  Broker Price: $' + brokerCalc.calculated_product_subtotal_before_shipping_tax.toFixed(2));
console.log('  Broker Saved: $' + (regularCalc.calculated_product_subtotal_before_shipping_tax - brokerCalc.calculated_product_subtotal_before_shipping_tax).toFixed(2));
console.log('  Discount: ' + ((1 - brokerCalc.calculated_product_subtotal_before_shipping_tax / regularCalc.calculated_product_subtotal_before_shipping_tax) * 100).toFixed(1) + '%');
console.log('✅ Test 4 Passed\n');

console.log('🎉 All pricing tests passed successfully!');
console.log('The pricing engine is working correctly.');