/**
 * Integration utilities to ensure the complete paper stock system 
 * works seamlessly with the existing pricing calculation engine
 */

import type { Tables } from '@/integrations/supabase/types';
import type { PaperStock as DocumentationPaperStock } from '@/utils/pricing/documentation-calculations';

type DatabasePaperStock = Tables<'paper_stocks'>;

/**
 * Convert database paper stock to documentation pricing engine format
 */
export function adaptPaperStockForPricing(dbPaperStock: DatabasePaperStock): DocumentationPaperStock {
  return {
    id: dbPaperStock.id,
    name: dbPaperStock.name,
    price_per_sq_inch: dbPaperStock.price_per_sq_inch || 0,
    second_side_markup_percent: dbPaperStock.second_side_markup_percent || 80,
    default_coating_id: undefined // This would come from paper_stock_coatings relationship
  };
}

/**
 * Calculate sides factor based on paper stock configuration
 * This matches the documentation pricing engine exactly
 */
export function calculateSidesFactor(
  sides: 'single' | 'double', 
  paperStock: DatabasePaperStock
): number {
  if (sides === 'single') {
    return 1.0;
  } else {
    // Double sided: 1 + (2nd Side Markup % / 100)
    // Each paper stock now has its own markup percentage
    const markupPercent = paperStock.second_side_markup_percent || 80;
    return 1.0 + (markupPercent / 100);
  }
}

/**
 * Validate paper stock has the required fields for pricing
 */
export function validatePaperStockForPricing(paperStock: DatabasePaperStock): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!paperStock.price_per_sq_inch || paperStock.price_per_sq_inch <= 0) {
    errors.push('Paper stock must have a valid price per square inch');
  }

  if (paperStock.second_side_markup_percent === null || paperStock.second_side_markup_percent === undefined) {
    errors.push('Paper stock must have a second side markup percentage defined');
  }

  if (paperStock.second_side_markup_percent !== null && 
      paperStock.second_side_markup_percent !== undefined && 
      (paperStock.second_side_markup_percent < 0 || paperStock.second_side_markup_percent > 300)) {
    errors.push('Second side markup percentage must be between 0% and 300%');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get sides pricing display for customer interface
 */
export function getSidesPricingDisplay(
  paperStock: DatabasePaperStock,
  basePricePerSqInch: number,
  areaInSqInches: number,
  quantity: number
): {
  singleSided: {
    available: boolean;
    pricePerUnit: number;
    totalPrice: number;
    description: string;
  };
  doubleSided: {
    available: boolean;
    pricePerUnit: number;
    totalPrice: number;
    description: string;
    markupPercent: number;
  };
} {
  const singleSidedPricePerUnit = basePricePerSqInch * areaInSqInches;
  const singleSidedTotal = singleSidedPricePerUnit * quantity;

  const markupPercent = paperStock.second_side_markup_percent || 80;
  const sidesFactor = 1.0 + (markupPercent / 100);
  const doubleSidedPricePerUnit = singleSidedPricePerUnit * sidesFactor;
  const doubleSidedTotal = doubleSidedPricePerUnit * quantity;

  return {
    singleSided: {
      available: paperStock.single_sided_available !== false,
      pricePerUnit: singleSidedPricePerUnit,
      totalPrice: singleSidedTotal,
      description: 'Front side only'
    },
    doubleSided: {
      available: paperStock.double_sided_available !== false,
      pricePerUnit: doubleSidedPricePerUnit,
      totalPrice: doubleSidedTotal,
      description: `Front and back (+${markupPercent}% for this paper)`,
      markupPercent
    }
  };
}

/**
 * Example pricing calculation for complete paper stock
 */
export function calculateExamplePricing(paperStock: DatabasePaperStock): {
  paperName: string;
  examples: Array<{
    scenario: string;
    quantity: number;
    size: string;
    area: number;
    singleSidedPrice: number;
    doubleSidedPrice: number;
    markupPercent: number;
  }>;
} {
  const examples = [
    { scenario: 'Business Cards', quantity: 1000, size: '3.5" × 2"', area: 7 },
    { scenario: 'Flyers', quantity: 500, size: '8.5" × 11"', area: 93.5 },
    { scenario: 'Postcards', quantity: 2500, size: '4.25" × 6"', area: 25.5 }
  ];

  return {
    paperName: paperStock.name,
    examples: examples.map(ex => {
      const singlePrice = ex.quantity * ex.area * paperStock.price_per_sq_inch;
      const sidesFactor = calculateSidesFactor('double', paperStock);
      const doublePrice = singlePrice * sidesFactor;
      
      return {
        ...ex,
        singleSidedPrice: singlePrice,
        doubleSidedPrice: doublePrice,
        markupPercent: paperStock.second_side_markup_percent || 80
      };
    })
  };
}