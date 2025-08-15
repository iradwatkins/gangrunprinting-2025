/**
 * Pricing Engine rebuilt to match EXACT specifications from documentation
 * File: "Custom E-commerce Printing Platform.md"
 * 
 * Formula from documentation:
 * 1. Base_Paper_Print_Price = EffectiveQuantity × EffectiveArea × PaperStock_BasePrice_PerSqInch × SidesFactor
 * 2. Adjusted_Base_Price = Base_Paper_Print_Price
 *    - If Broker with discount: Adjusted_Base_Price = Base_Paper_Print_Price × (1 - BrokerDiscountPercentage)
 *    - Else if "Our Tagline" selected & visible: Adjusted_Base_Price -= (Base_Paper_Print_Price × TaglineDiscountPercentage)
 * 3. Price_After_Base_Percentage_Modifiers = Adjusted_Base_Price
 *    - If "Exact Size" selected: Price_After_Base_Percentage_Modifiers += (Adjusted_Base_Price × ExactSizeMarkupPercentage)
 * 4. Price_After_Turnaround = Price_After_Base_Percentage_Modifiers × (1 + Selected_Turnaround_Markup_Percentage)
 * 5. Calculated_Product_Subtotal_Before_Shipping_Tax = Price_After_Turnaround + Sum of all selected discrete Add-on Services
 */

export interface PaperStock {
  id: string;
  name: string;
  price_per_sq_inch: number;
  second_side_markup_percent: number;
  default_coating_id?: string;
}

export interface PrintSize {
  id: string;
  name: string;
  width: number; // inches
  height: number; // inches
  is_custom: boolean;
}

export interface TurnaroundTime {
  id: string;
  name: string;
  price_markup_percent: number;
  business_days: number;
}

export interface AddOnConfiguration {
  // Our Tagline
  our_tagline?: {
    selected: boolean;
    discount_percentage: number; // 5%
  };
  
  // Exact Size
  exact_size?: {
    selected: boolean;
    markup_percentage: number; // 12.5%
  };
  
  // Digital Proof
  digital_proof?: {
    selected: boolean;
    price: number; // $5.00
  };
  
  // Perforation
  perforation?: {
    selected: boolean;
    setup_fee: number; // $20.00
    price_per_piece: number; // $0.01
    orientation: 'vertical' | 'horizontal';
    position: string;
  };
  
  // Score Only
  score_only?: {
    selected: boolean;
    setup_fee: number; // $17.00
    price_per_score_per_piece: number; // $0.01
    number_of_scores: number;
    positions: string;
  };
  
  // Folding
  folding?: {
    selected: boolean;
    fold_type: string;
    paper_type: 'text_paper' | 'card_stock';
    // Text Paper: $0.17 + $0.01/piece
    // Card Stock: $0.34 + $0.02/piece (includes mandatory basic score)
  };
  
  // Design Services
  design?: {
    selected: boolean;
    service_type: 'upload_artwork' | 'standard_custom' | 'rush_custom' | 'minor_changes' | 'major_changes';
    sides: 'one' | 'two';
  };
  
  // Banding
  banding?: {
    selected: boolean;
    price_per_bundle: number; // $0.75
    band_type: 'paper' | 'rubber';
    items_per_bundle: number; // default 100
  };
  
  // Shrink Wrapping
  shrink_wrapping?: {
    selected: boolean;
    price_per_bundle: number; // $0.30
    items_per_bundle: number;
  };
  
  // QR Code
  qr_code?: {
    selected: boolean;
    price: number; // $5.00
    content: string;
  };
  
  // Postal Delivery (DDU)
  postal_delivery?: {
    selected: boolean;
    price_per_box: number; // $30.00
    number_of_boxes: number;
  };
  
  // EDDM Process & Postage
  eddm_process?: {
    selected: boolean;
    setup_fee: number; // $50.00
    price_per_piece: number; // $0.239
    route_selection: 'us_select' | 'customer_provides';
    mandatory_banding: boolean; // Always true
  };
  
  // Hole Drilling
  hole_drilling?: {
    selected: boolean;
    setup_fee: number; // $20.00
    hole_type: 'custom' | 'binder_punch';
    number_of_holes?: number; // 1-5 for custom
    binder_type?: '2-hole' | '3-hole';
    hole_size: string;
    position: string;
  };
}

export interface BrokerDiscount {
  category_id: string;
  discount_percentage: number;
}

export interface ProductConfiguration {
  paper_stock: PaperStock;
  print_size: PrintSize;
  quantity: number;
  sides: 'single' | 'double'; // Determines SidesFactor
  turnaround_time: TurnaroundTime;
  add_ons: AddOnConfiguration;
  is_broker: boolean;
  broker_discounts?: BrokerDiscount[];
  category_id: string;
}

export interface DocumentationPriceCalculation {
  // Step 1: Base Paper Print Price
  effective_quantity: number;
  effective_area: number; // sq inches
  paper_stock_base_price_per_sq_inch: number;
  sides_factor: number; // 1.0 for single, 1 + (second_side_markup_percent/100) for double
  base_paper_print_price: number;
  
  // Step 2: Adjusted Base Price  
  broker_discount_applied: boolean;
  broker_discount_percentage: number;
  our_tagline_discount_applied: boolean;
  tagline_discount_percentage: number;
  adjusted_base_price: number;
  
  // Step 3: Base Percentage Modifiers
  exact_size_applied: boolean;
  exact_size_markup_percentage: number;
  price_after_base_percentage_modifiers: number;
  
  // Step 4: Turnaround Markup
  turnaround_markup_percentage: number;
  price_after_turnaround: number;
  
  // Step 5: Add-on Services
  discrete_addon_costs: Array<{
    name: string;
    cost: number;
    calculation_details: string;
  }>;
  total_addon_cost: number;
  
  // Final Result
  calculated_product_subtotal_before_shipping_tax: number;
  
  // Breakdown for display
  breakdown: {
    base_printing: number;
    broker_savings?: number;
    tagline_savings?: number;
    exact_size_markup?: number;
    turnaround_markup: number;
    addons: number;
    total: number;
  };
}

export class DocumentationPricingEngine {
  
  calculatePrice(config: ProductConfiguration): DocumentationPriceCalculation {
    const result: DocumentationPriceCalculation = {
      // Initialize all fields
      effective_quantity: config.quantity,
      effective_area: config.print_size.width * config.print_size.height,
      paper_stock_base_price_per_sq_inch: config.paper_stock.price_per_sq_inch,
      sides_factor: this.calculateSidesFactor(config.sides, config.paper_stock),
      base_paper_print_price: 0,
      
      broker_discount_applied: false,
      broker_discount_percentage: 0,
      our_tagline_discount_applied: false,
      tagline_discount_percentage: 5.0, // From documentation
      adjusted_base_price: 0,
      
      exact_size_applied: false,
      exact_size_markup_percentage: 12.5, // From documentation
      price_after_base_percentage_modifiers: 0,
      
      turnaround_markup_percentage: config.turnaround_time.price_markup_percent,
      price_after_turnaround: 0,
      
      discrete_addon_costs: [],
      total_addon_cost: 0,
      calculated_product_subtotal_before_shipping_tax: 0,
      
      breakdown: {
        base_printing: 0,
        turnaround_markup: 0,
        addons: 0,
        total: 0
      }
    };
    
    // Step 1: Calculate Base_Paper_Print_Price
    result.base_paper_print_price = 
      result.effective_quantity * 
      result.effective_area * 
      result.paper_stock_base_price_per_sq_inch * 
      result.sides_factor;
    
    // Step 2: Calculate Adjusted_Base_Price
    result.adjusted_base_price = result.base_paper_print_price;
    
    // Apply broker discount first (if applicable)
    if (config.is_broker && config.broker_discounts) {
      const categoryDiscount = config.broker_discounts.find(
        bd => bd.category_id === config.category_id
      );
      if (categoryDiscount) {
        result.broker_discount_applied = true;
        result.broker_discount_percentage = categoryDiscount.discount_percentage;
        result.adjusted_base_price = result.base_paper_print_price * (1 - result.broker_discount_percentage / 100);
        result.breakdown.broker_savings = result.base_paper_print_price - result.adjusted_base_price;
      }
    }
    // Else apply "Our Tagline" discount (if selected and visible - hidden for brokers with discount)
    else if (config.add_ons.our_tagline?.selected && !result.broker_discount_applied) {
      result.our_tagline_discount_applied = true;
      const tagline_discount_amount = result.base_paper_print_price * (result.tagline_discount_percentage / 100);
      result.adjusted_base_price -= tagline_discount_amount;
      result.breakdown.tagline_savings = tagline_discount_amount;
    }
    
    // Step 3: Apply Base Percentage Modifiers
    result.price_after_base_percentage_modifiers = result.adjusted_base_price;
    
    if (config.add_ons.exact_size?.selected) {
      result.exact_size_applied = true;
      const exact_size_markup = result.adjusted_base_price * (result.exact_size_markup_percentage / 100);
      result.price_after_base_percentage_modifiers += exact_size_markup;
      result.breakdown.exact_size_markup = exact_size_markup;
    }
    
    // Step 4: Apply Turnaround Markup
    result.price_after_turnaround = result.price_after_base_percentage_modifiers * 
      (1 + result.turnaround_markup_percentage / 100);
    result.breakdown.turnaround_markup = result.price_after_turnaround - result.price_after_base_percentage_modifiers;
    
    // Step 5: Calculate Add-on Services (Brokers pay retail for discrete add-ons & turnaround)
    result.discrete_addon_costs = this.calculateAddonCosts(config);
    result.total_addon_cost = result.discrete_addon_costs.reduce((sum, addon) => sum + addon.cost, 0);
    result.breakdown.addons = result.total_addon_cost;
    
    // Final Calculation
    result.calculated_product_subtotal_before_shipping_tax = result.price_after_turnaround + result.total_addon_cost;
    
    // Set breakdown totals
    result.breakdown.base_printing = result.adjusted_base_price;
    result.breakdown.total = result.calculated_product_subtotal_before_shipping_tax;
    
    return result;
  }
  
  private calculateSidesFactor(sides: 'single' | 'double', paperStock: PaperStock): number {
    if (sides === 'single') {
      return 1.0;
    } else {
      // Double sided: 1 + (2nd Side Markup % / 100)
      return 1.0 + (paperStock.second_side_markup_percent / 100);
    }
  }
  
  private calculateAddonCosts(config: ProductConfiguration): Array<{name: string; cost: number; calculation_details: string}> {
    const costs: Array<{name: string; cost: number; calculation_details: string}> = [];
    const addons = config.add_ons;
    
    // Digital Proof - $5.00 Fixed Fee
    if (addons.digital_proof?.selected) {
      costs.push({
        name: 'Digital Proof',
        cost: addons.digital_proof.price,
        calculation_details: `$${addons.digital_proof.price.toFixed(2)} flat fee`
      });
    }
    
    // Perforation - $20.00 Fixed Fee + $0.01/piece
    if (addons.perforation?.selected) {
      const cost = addons.perforation.setup_fee + (addons.perforation.price_per_piece * config.quantity);
      costs.push({
        name: 'Perforation',
        cost: cost,
        calculation_details: `$${addons.perforation.setup_fee} setup + $${addons.perforation.price_per_piece} × ${config.quantity} pieces`
      });
    }
    
    // Score Only - $17.00 Fixed Fee + ($0.01 * Number of Scores)/piece
    if (addons.score_only?.selected) {
      const cost = addons.score_only.setup_fee + 
        (addons.score_only.price_per_score_per_piece * addons.score_only.number_of_scores * config.quantity);
      costs.push({
        name: 'Score Only',
        cost: cost,
        calculation_details: `$${addons.score_only.setup_fee} setup + $${addons.score_only.price_per_score_per_piece} × ${addons.score_only.number_of_scores} scores × ${config.quantity} pieces`
      });
    }
    
    // Folding - Text Paper: $0.17 + $0.01/piece, Card Stock: $0.34 + $0.02/piece
    if (addons.folding?.selected) {
      let setup_fee = 0;
      let price_per_piece = 0;
      
      if (addons.folding.paper_type === 'text_paper') {
        setup_fee = 0.17;
        price_per_piece = 0.01;
      } else if (addons.folding.paper_type === 'card_stock') {
        setup_fee = 0.34;
        price_per_piece = 0.02;
      }
      
      const cost = setup_fee + (price_per_piece * config.quantity);
      const note = addons.folding.paper_type === 'card_stock' ? ' (includes mandatory basic score)' : '';
      costs.push({
        name: 'Folding',
        cost: cost,
        calculation_details: `$${setup_fee} setup + $${price_per_piece} × ${config.quantity} pieces${note}`
      });
    }
    
    // Design Services - Variable pricing based on service type
    if (addons.design?.selected && addons.design.service_type !== 'upload_artwork') {
      let cost = 0;
      let description = '';
      
      switch (addons.design.service_type) {
        case 'standard_custom':
          cost = addons.design.sides === 'one' ? 90.00 : 135.00;
          description = `Standard Custom Design (${addons.design.sides} side${addons.design.sides === 'two' ? 's' : ''})`;
          break;
        case 'rush_custom':
          cost = addons.design.sides === 'one' ? 160.00 : 240.00;
          description = `Rush Custom Design (${addons.design.sides} side${addons.design.sides === 'two' ? 's' : ''})`;
          break;
        case 'minor_changes':
          cost = 22.50;
          description = 'Design Changes - Minor';
          break;
        case 'major_changes':
          cost = 45.00;
          description = 'Design Changes - Major';
          break;
      }
      
      costs.push({
        name: 'Design',
        cost: cost,
        calculation_details: description
      });
    }
    
    // Banding - $0.75/bundle
    if (addons.banding?.selected) {
      const bundles = Math.ceil(config.quantity / addons.banding.items_per_bundle);
      const cost = bundles * addons.banding.price_per_bundle;
      costs.push({
        name: 'Banding',
        cost: cost,
        calculation_details: `${bundles} bundles × $${addons.banding.price_per_bundle} (${addons.banding.items_per_bundle} items/bundle)`
      });
    }
    
    // Shrink Wrapping - $0.30/bundle
    if (addons.shrink_wrapping?.selected) {
      const bundles = Math.ceil(config.quantity / addons.shrink_wrapping.items_per_bundle);
      const cost = bundles * addons.shrink_wrapping.price_per_bundle;
      costs.push({
        name: 'Shrink Wrapping',
        cost: cost,
        calculation_details: `${bundles} bundles × $${addons.shrink_wrapping.price_per_bundle} (${addons.shrink_wrapping.items_per_bundle} items/bundle)`
      });
    }
    
    // QR Code - $5.00 Fixed Fee
    if (addons.qr_code?.selected) {
      costs.push({
        name: 'QR Code',
        cost: addons.qr_code.price,
        calculation_details: `$${addons.qr_code.price.toFixed(2)} flat fee`
      });
    }
    
    // Postal Delivery (DDU) - $30.00/box
    if (addons.postal_delivery?.selected) {
      const cost = addons.postal_delivery.number_of_boxes * addons.postal_delivery.price_per_box;
      costs.push({
        name: 'Postal Delivery (DDU)',
        cost: cost,
        calculation_details: `${addons.postal_delivery.number_of_boxes} boxes × $${addons.postal_delivery.price_per_box}`
      });
    }
    
    // EDDM Process & Postage - $50.00 + $0.239/piece (includes mandatory banding)
    if (addons.eddm_process?.selected) {
      const cost = addons.eddm_process.setup_fee + (addons.eddm_process.price_per_piece * config.quantity);
      costs.push({
        name: 'EDDM Process & Postage',
        cost: cost,
        calculation_details: `$${addons.eddm_process.setup_fee} setup + $${addons.eddm_process.price_per_piece} × ${config.quantity} pieces (includes mandatory banding)`
      });
    }
    
    // Hole Drilling - $20.00 + variable per-piece
    if (addons.hole_drilling?.selected) {
      let per_piece_cost = 0;
      let description = '';
      
      if (addons.hole_drilling.hole_type === 'custom' && addons.hole_drilling.number_of_holes) {
        per_piece_cost = addons.hole_drilling.number_of_holes * 0.02; // $0.02 per hole per piece
        description = `${addons.hole_drilling.number_of_holes} custom holes`;
      } else if (addons.hole_drilling.hole_type === 'binder_punch') {
        per_piece_cost = 0.01; // $0.01 per piece for binder punch
        description = `${addons.hole_drilling.binder_type} binder punch`;
      }
      
      const cost = addons.hole_drilling.setup_fee + (per_piece_cost * config.quantity);
      costs.push({
        name: 'Hole Drilling',
        cost: cost,
        calculation_details: `$${addons.hole_drilling.setup_fee} setup + $${per_piece_cost} × ${config.quantity} pieces (${description})`
      });
    }
    
    return costs;
  }
}

export const documentationPricingEngine = new DocumentationPricingEngine();