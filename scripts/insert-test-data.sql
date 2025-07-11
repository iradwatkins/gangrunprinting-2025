-- Test Data for GangRun Printing Platform
-- This script inserts sample data for testing the admin pages

-- Insert Product Categories
INSERT INTO product_categories (name, slug, description, is_active, sort_order) VALUES
('Business Cards', 'business-cards', 'Professional business cards for networking and branding', true, 1),
('Flyers', 'flyers', 'Marketing flyers for promotions and events', true, 2),
('Brochures', 'brochures', 'Folded brochures for detailed product information', true, 3),
('Postcards', 'postcards', 'Direct mail postcards for marketing campaigns', true, 4),
('Banners', 'banners', 'Large format banners for events and displays', true, 5),
('Posters', 'posters', 'High-quality posters for advertising and decoration', true, 6),
('Stickers', 'stickers', 'Custom stickers and labels for branding', true, 7),
('Letterheads', 'letterheads', 'Professional letterheads for business correspondence', true, 8)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Insert Vendors
INSERT INTO vendors (name, contact_email, phone, website, address, city, state, zip_code, country, is_active, notes) VALUES
('PrintPro Solutions', 'orders@printpro.com', '555-0100', 'https://printpro.com', '123 Print Street', 'Los Angeles', 'CA', '90001', 'USA', true, 'Primary vendor for business cards and flyers'),
('QuickPrint Express', 'support@quickprint.com', '555-0200', 'https://quickprint.com', '456 Fast Lane', 'Chicago', 'IL', '60601', 'USA', true, 'Fast turnaround specialist'),
('Premium Print Co', 'hello@premiumprint.com', '555-0300', 'https://premiumprint.com', '789 Quality Ave', 'New York', 'NY', '10001', 'USA', true, 'High-end printing services'),
('BudgetPrint Direct', 'sales@budgetprint.com', '555-0400', 'https://budgetprint.com', '321 Value Blvd', 'Dallas', 'TX', '75201', 'USA', true, 'Economy printing options')
ON CONFLICT (name) DO UPDATE SET
  contact_email = EXCLUDED.contact_email,
  phone = EXCLUDED.phone,
  website = EXCLUDED.website,
  is_active = EXCLUDED.is_active;

-- Insert Paper Stocks
INSERT INTO paper_stocks (name, brand, weight, finish, color, description, price_per_sheet, price_per_sq_inch, weight_per_sq_inch, is_active) VALUES
('100lb Gloss Text', 'Mohawk', 100, 'Gloss', 'White', 'Premium glossy text weight paper', 0.25, 0.00173611, 0.0069444, true),
('80lb Matte Cover', 'Neenah', 80, 'Matte', 'Natural', 'Smooth matte finish cover stock', 0.30, 0.00208333, 0.0055556, true),
('70lb Uncoated Text', 'Domtar', 70, 'Uncoated', 'White', 'Standard uncoated text paper', 0.20, 0.00138889, 0.0048611, true),
('120lb Gloss Cover', 'Sappi', 120, 'Gloss', 'Bright White', 'Heavy glossy cover stock', 0.35, 0.00243056, 0.0083333, true),
('14pt C2S', 'International Paper', 140, 'Coated 2 Sides', 'White', 'Standard business card stock', 0.40, 0.00277778, 0.0097222, true),
('16pt C2S', 'Georgia Pacific', 160, 'Coated 2 Sides', 'White', 'Premium business card stock', 0.45, 0.00312500, 0.0111111, true),
('100lb Silk Text', 'Mohawk', 100, 'Silk', 'White', 'Smooth silk finish text weight', 0.28, 0.00194444, 0.0069444, true),
('130lb Dull Cover', 'Neenah', 130, 'Dull', 'White', 'Dull coated cover stock', 0.38, 0.00263889, 0.0090278, true)
ON CONFLICT (name) DO UPDATE SET
  brand = EXCLUDED.brand,
  weight = EXCLUDED.weight,
  finish = EXCLUDED.finish,
  price_per_sheet = EXCLUDED.price_per_sheet,
  is_active = EXCLUDED.is_active;

-- Insert Turnaround Times
INSERT INTO turnaround_times (name, business_days, price_multiplier, is_active, is_default, sort_order) VALUES
('Standard (5-7 days)', 7, 1.0, true, true, 1),
('Rush (3-4 days)', 4, 1.25, true, false, 2),
('Express (2 days)', 2, 1.5, true, false, 3),
('Next Day', 1, 2.0, true, false, 4),
('Same Day', 0, 3.0, true, false, 5)
ON CONFLICT (name) DO UPDATE SET
  business_days = EXCLUDED.business_days,
  price_multiplier = EXCLUDED.price_multiplier,
  is_active = EXCLUDED.is_active,
  is_default = EXCLUDED.is_default;

-- Insert Print Sizes
INSERT INTO print_sizes (name, width_inches, height_inches, is_active, sort_order) VALUES
('Business Card (3.5" x 2")', 3.5, 2.0, true, 1),
('Postcard (4" x 6")', 4.0, 6.0, true, 2),
('Postcard (5" x 7")', 5.0, 7.0, true, 3),
('Flyer (8.5" x 11")', 8.5, 11.0, true, 4),
('Flyer (5.5" x 8.5")', 5.5, 8.5, true, 5),
('Poster (11" x 17")', 11.0, 17.0, true, 6),
('Poster (18" x 24")', 18.0, 24.0, true, 7),
('Poster (24" x 36")', 24.0, 36.0, true, 8),
('Banner (2\' x 6\')', 24.0, 72.0, true, 9),
('Banner (3\' x 8\')', 36.0, 96.0, true, 10)
ON CONFLICT (name) DO UPDATE SET
  width_inches = EXCLUDED.width_inches,
  height_inches = EXCLUDED.height_inches,
  is_active = EXCLUDED.is_active;

-- Insert Quantity Groups
INSERT INTO quantities (name, values, default_value, has_custom, is_active) VALUES
('Small Print Runs', '25,50,100,250,500', 100, false, true),
('Standard Print Runs', '100,250,500,1000,2500,5000', 500, false, true),
('Large Print Runs', '1000,2500,5000,10000,25000,50000', 5000, false, true),
('Business Card Quantities', '100,250,500,1000,2500,5000,custom', 500, true, true),
('Custom Quantities', '100,250,500,1000,custom', 250, true, true)
ON CONFLICT (name) DO UPDATE SET
  values = EXCLUDED.values,
  default_value = EXCLUDED.default_value,
  has_custom = EXCLUDED.has_custom,
  is_active = EXCLUDED.is_active;

-- Insert Add-ons
INSERT INTO add_ons (name, code, pricing_model, base_price, configuration, is_active, sort_order) VALUES
('Digital Proof', 'digital-proof', 'FLAT', 5.00, '{"description": "PDF proof before printing"}', true, 1),
('Our Tagline', 'our-tagline', 'FLAT', 0.00, '{"description": "Add our company tagline"}', true, 2),
('Perforation', 'perforation', 'SUB_OPTIONS', 0.00, '{"sub_options": [{"name": "1 line", "price": 25}, {"name": "2 lines", "price": 50}, {"name": "3 lines", "price": 75}]}', true, 3),
('Score Only', 'score-only', 'SUB_OPTIONS', 0.00, '{"sub_options": [{"name": "1 score", "price": 20}, {"name": "2 scores", "price": 40}]}', true, 4),
('Folding', 'folding', 'SUB_OPTIONS', 0.00, '{"sub_options": [{"name": "Half-fold", "price": 30}, {"name": "Tri-fold", "price": 45}, {"name": "Z-fold", "price": 45}]}', true, 5),
('Design Service', 'design', 'TIERED', 0.00, '{"tiers": [{"min": 0, "max": 999999, "price": 150}], "description": "Professional design service"}', true, 6),
('Exact Size Cut', 'exact-size', 'FLAT', 15.00, '{"description": "Custom size cutting"}', true, 7),
('Banding', 'banding', 'FLAT', 10.00, '{"description": "Bundle with paper bands"}', true, 8),
('Shrink Wrapping', 'shrink-wrapping', 'FLAT', 20.00, '{"description": "Shrink wrap bundles"}', true, 9),
('QR Code', 'qr-code', 'FLAT', 25.00, '{"description": "Add QR code to design"}', true, 10),
('Postal Delivery', 'postal-delivery', 'PERCENTAGE', 15.00, '{"description": "Direct mail delivery", "percentage": true}', true, 11),
('EDDM Process', 'eddm-process', 'FLAT', 150.00, '{"description": "Every Door Direct Mail processing", "requires": ["banding"]}', true, 12),
('Hole Drilling', 'hole-drilling', 'SUB_OPTIONS', 0.00, '{"sub_options": [{"name": "1 hole", "price": 15}, {"name": "2 holes", "price": 25}, {"name": "3 holes", "price": 35}]}', true, 13)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  pricing_model = EXCLUDED.pricing_model,
  base_price = EXCLUDED.base_price,
  configuration = EXCLUDED.configuration,
  is_active = EXCLUDED.is_active;

-- Get IDs for linking
DO $$
DECLARE
  v_category_id UUID;
  v_vendor_id UUID;
  v_product_id UUID;
BEGIN
  -- Get Business Cards category ID
  SELECT id INTO v_category_id FROM product_categories WHERE slug = 'business-cards' LIMIT 1;
  -- Get PrintPro vendor ID
  SELECT id INTO v_vendor_id FROM vendors WHERE name = 'PrintPro Solutions' LIMIT 1;
  
  -- Insert Products only if we have valid category and vendor
  IF v_category_id IS NOT NULL AND v_vendor_id IS NOT NULL THEN
    INSERT INTO products (name, slug, description, category_id, vendor_id, base_price, setup_fee, minimum_quantity, is_active) VALUES
    ('Standard Business Cards', 'standard-business-cards', 'Professional 16pt business cards with full color printing', v_category_id, v_vendor_id, 39.99, 0.00, 100, true),
    ('Premium Business Cards', 'premium-business-cards', 'Luxury 32pt business cards with special finishes', v_category_id, v_vendor_id, 79.99, 25.00, 100, true),
    ('Economy Business Cards', 'economy-business-cards', 'Budget-friendly 14pt business cards', v_category_id, v_vendor_id, 24.99, 0.00, 250, true)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      base_price = EXCLUDED.base_price,
      is_active = EXCLUDED.is_active;
  END IF;

  -- Get Flyers category ID and QuickPrint vendor ID
  SELECT id INTO v_category_id FROM product_categories WHERE slug = 'flyers' LIMIT 1;
  SELECT id INTO v_vendor_id FROM vendors WHERE name = 'QuickPrint Express' LIMIT 1;
  
  IF v_category_id IS NOT NULL AND v_vendor_id IS NOT NULL THEN
    INSERT INTO products (name, slug, description, category_id, vendor_id, base_price, setup_fee, minimum_quantity, is_active) VALUES
    ('Standard Flyers 8.5x11', 'standard-flyers-8-5x11', 'Full color flyers on 100lb gloss text', v_category_id, v_vendor_id, 89.99, 0.00, 100, true),
    ('Premium Flyers 8.5x11', 'premium-flyers-8-5x11', 'Premium flyers on thick cardstock', v_category_id, v_vendor_id, 149.99, 0.00, 100, true),
    ('Half Page Flyers', 'half-page-flyers', 'Compact 5.5x8.5 flyers', v_category_id, v_vendor_id, 59.99, 0.00, 100, true)
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      base_price = EXCLUDED.base_price,
      is_active = EXCLUDED.is_active;
  END IF;
END $$;

-- Link paper stocks to products (example for business cards)
DO $$
DECLARE
  v_product_id UUID;
  v_paper_stock_id UUID;
BEGIN
  -- Get Standard Business Cards product
  SELECT id INTO v_product_id FROM products WHERE slug = 'standard-business-cards' LIMIT 1;
  
  IF v_product_id IS NOT NULL THEN
    -- Link all relevant paper stocks
    FOR v_paper_stock_id IN SELECT id FROM paper_stocks WHERE is_active = true AND name IN ('14pt C2S', '16pt C2S', '100lb Gloss Text')
    LOOP
      INSERT INTO product_paper_stocks (product_id, paper_stock_id, is_default, price_adjustment)
      VALUES (v_product_id, v_paper_stock_id, v_paper_stock_id = (SELECT id FROM paper_stocks WHERE name = '16pt C2S' LIMIT 1), 0.00)
      ON CONFLICT (product_id, paper_stock_id) DO UPDATE SET
        is_default = EXCLUDED.is_default,
        price_adjustment = EXCLUDED.price_adjustment;
    END LOOP;
  END IF;
END $$;

-- Success message
SELECT 'Test data inserted successfully!' as message;