# CRITICAL: Pricing System Preservation Documentation

**Created:** December 15, 2024  
**Priority:** CRITICAL - DO NOT MODIFY WITHOUT APPROVAL  
**Owner:** BMad Orchestrator

## 🚨 CRITICAL WARNING 🚨

The pricing system is the **CORE BUSINESS LOGIC** of Gang Run Printing. Any modification could result in:
- Revenue loss
- Customer pricing errors
- Broker discount failures
- Legal/contractual issues

## Pricing System Components

### 1. Documentation-Compliant Pricing Engine
**File:** `/src/utils/pricing/documentation-calculations.ts`

**Formula (5 Steps):**
```typescript
Step 1: Base_Paper_Print_Price = paper_stock.price_per_sq_inch × (width × height) × quantity
Step 2: Adjusted_Base_Price = Base_Paper_Print_Price × (1 + second_side_markup if double-sided)
Step 3: Exact_Size_Price = Adjusted_Base_Price × exact_size_multiplier (if exact size)
Step 4: Turnaround_Price = Exact_Size_Price × turnaround_multiplier
Step 5: Final_Price = Turnaround_Price + Sum(all_add_on_prices)
```

### 2. Advanced Broker Pricing Engine
**File:** `/src/utils/pricing/calculations.ts`

**Broker Tiers:**
```typescript
Bronze: 5% base discount, $10k annual minimum
Silver: 10% base discount, $25k annual minimum  
Gold: 15% base discount, $50k annual minimum
Platinum: 20% base discount, $100k annual minimum
```

**Volume Breakpoints:**
```typescript
1-24: 0% discount, 1.0x multiplier
25-49: 2% discount, 1.1x multiplier
50-99: 5% discount, 1.2x multiplier
100-249: 8% discount, 1.3x multiplier
250-499: 12% discount, 1.4x multiplier
500-999: 15% discount, 1.5x multiplier
1000-2499: 18% discount, 1.6x multiplier
2500-4999: 22% discount, 1.8x multiplier
5000+: 25% discount, 2.0x multiplier
```

### 3. Add-ons System (13 Complex Add-ons)

**Critical Add-ons with Exact Pricing:**

1. **Digital Proof**: $5.00 flat fee
2. **Our Tagline**: 5% discount (hidden from brokers)
3. **Perforation**: $20 setup + $0.01/piece
4. **Score Only**: $17 setup + ($0.01 × number of scores)/piece
5. **Folding**: 
   - Text: $0.17 + $0.01/piece
   - Card: $0.34 + $0.02/piece (mandatory score)
6. **Design Services**: $22.50-$240 based on type
7. **Exact Size**: 1.5x multiplier on base price
8. **Banding**: $8 + $0.01/piece
9. **Shrink Wrapping**: $8 + $0.04/piece
10. **QR Code**: $5 flat fee
11. **Postal Delivery**: $0.239/piece
12. **EDDM Process**: $50 + $0.239/piece (mandatory banding)
13. **Hole Drilling**: $20 + variable per piece

### 4. Business Rules & Dependencies

**Critical Dependencies:**
- EDDM Process → Automatically adds Banding
- Card Stock Folding → Automatically adds Score
- Exact Size → Validates dimensions against paper stock
- Turnaround Time → Affects pricing multiplier

**Broker Rules:**
- Brokers see wholesale pricing
- "Our Tagline" discount hidden from brokers
- Category-specific discounts apply
- Volume bonuses stack with tier discounts

## Migration Preservation Strategy

### Phase 1: Isolation
```typescript
// Create standalone pricing module
// shared/pricing/index.ts
export { DocumentationPricingCalculator } from './documentation-calculations';
export { AdvancedPricingCalculator } from './calculations';
export { VolumeBreakpoints } from './volume';
export { BrokerTiers } from './broker';
```

### Phase 2: Testing
```typescript
// Create comprehensive test suite
// shared/pricing/__tests__/pricing.test.ts
describe('Pricing Engine Preservation', () => {
  it('should calculate exact same price for all scenarios', () => {
    // Test every permutation
  });
});
```

### Phase 3: Abstraction
```typescript
// Create interface for both systems
interface PricingService {
  calculatePrice(context: PricingContext): Promise<PriceCalculation>;
  applyBrokerDiscount(price: number, broker: BrokerProfile): number;
  calculateAddOns(addOns: AddOn[], quantity: number): number;
}
```

## Database Tables (DO NOT MODIFY SCHEMA)

**Critical Tables:**
- `paper_stocks` - price_per_sq_inch, second_side_markup_percent
- `add_ons` - JSONB configuration with pricing models
- `user_profiles` - broker_status, tier, category_discounts
- `turnaround_times` - multipliers for rush orders
- `print_sizes` - standard sizes and validations

## Testing Requirements

Before ANY migration:
1. Create snapshot of 100+ pricing scenarios
2. Run comparison tests between old and new
3. Verify to the penny accuracy
4. Test all broker tier combinations
5. Validate all add-on dependencies

## Monitoring

Post-migration monitoring:
- Log all price calculations
- Alert on any variance > $0.01
- Track broker discount applications
- Monitor add-on selection patterns

## Approval Required

Changes to pricing require approval from:
1. Product Owner
2. Finance Team
3. Development Lead
4. QA Lead

## Emergency Rollback

If pricing errors detected:
1. Immediate rollback to Vite app
2. Log all affected orders
3. Manual price reconciliation
4. Customer notification if needed

---

**Remember**: The pricing system is the heart of the business. Treat it with extreme care.