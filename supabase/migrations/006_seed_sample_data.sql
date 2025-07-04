-- Seed sample data for development and testing

-- Insert sample product categories
INSERT INTO public.product_categories (name, slug, description, sort_order) VALUES
('Business Cards', 'business-cards', 'Professional business cards for networking and marketing', 1),
('Flyers', 'flyers', 'Eye-catching flyers for promotions and announcements', 2),
('Postcards', 'postcards', 'Custom postcards for direct mail campaigns', 3),
('Banners', 'banners', 'Large format banners for events and advertising', 4),
('Posters', 'posters', 'High-quality posters for marketing and decoration', 5),
('Brochures', 'brochures', 'Tri-fold and bi-fold brochures for detailed information', 6),
('Calendars', 'calendars', 'Custom calendars for promotional purposes', 7),
('Certificates', 'certificates', 'Professional certificates and awards', 8),
('Stickers', 'stickers', 'Custom stickers and labels', 9),
('Booklets', 'booklets', 'Multi-page booklets and catalogs', 10);

-- Insert sample vendors
INSERT INTO public.vendors (name, email, phone, address, incoming_email_addresses, supported_shipping_carriers) VALUES
('PrintTech Solutions', 'orders@printtech.com', '555-0101', 
 '{"street": "123 Print St", "city": "Atlanta", "state": "GA", "zip": "30309"}',
 '["orders@printtech.com", "production@printtech.com"]',
 '["UPS", "FedEx", "USPS"]'),
('QuickPrint Pro', 'production@quickprint.com', '555-0102',
 '{"street": "456 Speed Ave", "city": "Miami", "state": "FL", "zip": "33101"}',
 '["production@quickprint.com", "rush@quickprint.com"]',
 '["FedEx", "DHL", "USPS"]'),
('Premium Graphics', 'jobs@premiumgfx.com', '555-0103',
 '{"street": "789 Quality Blvd", "city": "Dallas", "state": "TX", "zip": "75201"}',
 '["jobs@premiumgfx.com"]',
 '["UPS", "FedEx"]');

-- Insert sample paper stocks
INSERT INTO public.paper_stocks (name, weight, price_per_sq_inch, description) VALUES
('Standard White', 80, 0.00125000, '80gsm standard white paper for everyday printing'),
('Premium Matte', 120, 0.00185000, '120gsm premium matte finish paper'),
('Glossy Photo', 200, 0.00275000, '200gsm high-gloss photo paper'),
('Recycled Eco', 90, 0.00135000, '90gsm environmentally friendly recycled paper'),
('Luxury Cardstock', 300, 0.00425000, '300gsm heavy cardstock for premium feel'),
('Metallic Silver', 250, 0.00385000, '250gsm metallic silver specialty paper');

-- Insert sample coatings
INSERT INTO public.coatings (name, price_modifier, description) VALUES
('None', 0.0000, 'No coating applied'),
('Matte Lamination', 15.5000, 'Matte protective lamination'),
('Gloss Lamination', 18.5000, 'High-gloss protective lamination'),
('UV Coating', 25.0000, 'Ultra-violet protective coating'),
('Soft Touch', 35.0000, 'Premium soft-touch lamination'),
('Spot UV', 45.0000, 'Selective UV coating for highlights');

-- Insert sample print sizes
INSERT INTO public.print_sizes (name, width, height) VALUES
('Business Card', 3.50, 2.00),
('Postcard 4x6', 6.00, 4.00),
('Flyer 5.5x8.5', 8.50, 5.50),
('Half Sheet 5.5x8.5', 8.50, 5.50),
('Full Sheet 8.5x11', 11.00, 8.50),
('Tabloid 11x17', 17.00, 11.00),
('Poster 18x24', 24.00, 18.00),
('Banner 24x36', 36.00, 24.00),
('Large Banner 36x48', 48.00, 36.00);

-- Insert sample turnaround times
INSERT INTO public.turnaround_times (name, business_days, price_markup_percent) VALUES
('Standard', 5, 0.00),
('Expedited', 3, 25.00),
('Rush', 1, 75.00),
('Same Day', 0, 150.00);

-- Insert sample add-ons
INSERT INTO public.add_ons (name, pricing_model, configuration, description) VALUES
('Digital Proof', 'flat', '{"price": 15.00}', 'Digital proof for approval before printing'),
('Hole Drilling', 'per_unit', '{"price_per_unit": 0.25, "setup_fee": 25.00}', 'Hole drilling service'),
('Folding Service', 'per_unit', '{"price_per_unit": 0.15}', 'Professional folding service'),
('Design Services', 'flat', '{"price": 85.00}', 'Custom design services'),
('Rush Processing', 'percentage', '{"percentage": 50.0}', 'Rush order processing'),
('Binding Service', 'per_unit', '{"price_per_unit": 1.25, "minimum_charge": 25.00}', 'Professional binding service');

-- Create relationships between paper stocks and coatings
INSERT INTO public.paper_stock_coatings (paper_stock_id, coating_id, is_default)
SELECT ps.id, c.id, (c.name = 'None') as is_default
FROM public.paper_stocks ps
CROSS JOIN public.coatings c
WHERE ps.name IN ('Standard White', 'Premium Matte', 'Glossy Photo')
  AND c.name IN ('None', 'Matte Lamination', 'Gloss Lamination');

-- Add metallic paper with UV coatings only
INSERT INTO public.paper_stock_coatings (paper_stock_id, coating_id, is_default)
SELECT ps.id, c.id, (c.name = 'None') as is_default
FROM public.paper_stocks ps
CROSS JOIN public.coatings c
WHERE ps.name = 'Metallic Silver'
  AND c.name IN ('None', 'UV Coating', 'Spot UV');

-- Insert sample products
INSERT INTO public.products (name, slug, description, category_id, vendor_id, base_price, minimum_quantity)
SELECT 
    'Standard Business Cards',
    'standard-business-cards',
    'Professional business cards printed on quality cardstock',
    (SELECT id FROM public.product_categories WHERE slug = 'business-cards'),
    (SELECT id FROM public.vendors WHERE name = 'PrintTech Solutions'),
    25.00,
    250
UNION ALL
SELECT 
    'Premium Flyers',
    'premium-flyers',
    'High-quality flyers for marketing and promotions',
    (SELECT id FROM public.product_categories WHERE slug = 'flyers'),
    (SELECT id FROM public.vendors WHERE name = 'QuickPrint Pro'),
    45.00,
    100
UNION ALL
SELECT 
    'Marketing Postcards',
    'marketing-postcards',
    'Direct mail postcards with vibrant colors',
    (SELECT id FROM public.product_categories WHERE slug = 'postcards'),
    (SELECT id FROM public.vendors WHERE name = 'Premium Graphics'),
    35.00,
    500;

-- Create product relationships with paper stocks
INSERT INTO public.product_paper_stocks (product_id, paper_stock_id, is_default)
SELECT p.id, ps.id, (ps.name = 'Standard White') as is_default
FROM public.products p
CROSS JOIN public.paper_stocks ps
WHERE p.slug = 'standard-business-cards'
  AND ps.name IN ('Standard White', 'Premium Matte', 'Luxury Cardstock');

INSERT INTO public.product_paper_stocks (product_id, paper_stock_id, is_default)
SELECT p.id, ps.id, (ps.name = 'Premium Matte') as is_default
FROM public.products p
CROSS JOIN public.paper_stocks ps
WHERE p.slug = 'premium-flyers'
  AND ps.name IN ('Premium Matte', 'Glossy Photo');

INSERT INTO public.product_paper_stocks (product_id, paper_stock_id, is_default)
SELECT p.id, ps.id, (ps.name = 'Glossy Photo') as is_default
FROM public.products p
CROSS JOIN public.paper_stocks ps
WHERE p.slug = 'marketing-postcards'
  AND ps.name IN ('Glossy Photo', 'Premium Matte');

-- Create product relationships with print sizes
INSERT INTO public.product_print_sizes (product_id, print_size_id, is_default)
SELECT p.id, pz.id, true
FROM public.products p
CROSS JOIN public.print_sizes pz
WHERE p.slug = 'standard-business-cards'
  AND pz.name = 'Business Card';

INSERT INTO public.product_print_sizes (product_id, print_size_id, is_default)
SELECT p.id, pz.id, (pz.name = 'Flyer 5.5x8.5') as is_default
FROM public.products p
CROSS JOIN public.print_sizes pz
WHERE p.slug = 'premium-flyers'
  AND pz.name IN ('Flyer 5.5x8.5', 'Half Sheet 5.5x8.5', 'Full Sheet 8.5x11');

INSERT INTO public.product_print_sizes (product_id, print_size_id, is_default)
SELECT p.id, pz.id, true
FROM public.products p
CROSS JOIN public.print_sizes pz
WHERE p.slug = 'marketing-postcards'
  AND pz.name = 'Postcard 4x6';

-- Create product relationships with turnaround times
INSERT INTO public.product_turnaround_times (product_id, turnaround_time_id, is_default)
SELECT p.id, tt.id, (tt.name = 'Standard') as is_default
FROM public.products p
CROSS JOIN public.turnaround_times tt
WHERE tt.name IN ('Standard', 'Expedited', 'Rush');

-- Create product relationships with add-ons
INSERT INTO public.product_add_ons (product_id, add_on_id, is_mandatory)
SELECT p.id, ao.id, false
FROM public.products p
CROSS JOIN public.add_ons ao
WHERE ao.name IN ('Digital Proof', 'Design Services', 'Rush Processing');

-- Insert a sample admin user profile (will be created when a user with matching email signs up)
-- Note: This will only work after a user actually signs up with this email
-- INSERT INTO public.user_profiles (user_id, is_broker, broker_category_discounts, company_name)
-- VALUES (
--     (SELECT id FROM auth.users WHERE email = 'admin@gangrunprinting.com' LIMIT 1),
--     true,
--     '{"admin": true, "business-cards": 20.0, "flyers": 15.0}',
--     'GangRun Printing Admin'
-- );

-- Create a sample broker discount configuration for testing
-- This demonstrates the JSONB structure for broker category discounts
-- Example: {"business-cards": 15.0, "flyers": 10.0, "postcards": 12.5}