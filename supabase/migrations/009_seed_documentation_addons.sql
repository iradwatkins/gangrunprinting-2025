-- Seed data for exact add-ons specified in documentation
-- This matches the requirements from "Custom E-commerce Printing Platform.md"

-- First, insert the sides options
INSERT INTO public.sides (name, multiplier, tooltip_text) VALUES
('Single Sided', 1.00, 'Printing on one side only'),
('Double Sided (4/4)', 2.00, 'Full color printing on both sides - uses 2nd side markup from paper stock')
ON CONFLICT DO NOTHING;

-- Insert standard quantities as specified in documentation
INSERT INTO public.quantities (name, value, is_custom) VALUES
('250', 250, false),
('500', 500, false),
('1000', 1000, false),
('2500', 2500, false),
('5000', 5000, false),
('10000', 10000, false),
('Custom...', NULL, true)
ON CONFLICT DO NOTHING;

-- Insert the exact add-ons from documentation with precise pricing

-- 1. Digital Proof - $5.00 Fixed Fee
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days
) VALUES (
    'Digital Proof',
    'flat',
    '{"price": 5.00}',
    'Digital proof for approval before production',
    'We will email you a digital proof for your approval before production begins. This helps ensure your order is exactly as you want it.',
    0
) ON CONFLICT DO NOTHING;

-- 2. Our Tagline - 5% discount off Base_Paper_Print_Price (before Turnaround markup)
-- Hidden for Brokers with assigned discount, No turnaround impact
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    admin_notes
) VALUES (
    'Our Tagline',
    'percentage',
    '{"discount_percentage": 5.0, "applies_to": "base_paper_print_price", "hidden_for_brokers": true}',
    '5% discount for including our tagline',
    'Add our company tagline to your design for a 5% discount on base printing costs.',
    0,
    'Hidden for brokers with assigned discount. Discount applies before turnaround markup.'
) ON CONFLICT DO NOTHING;

-- 3. Perforation - $20.00 Fixed Fee + $0.01/piece
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options
) VALUES (
    'Perforation',
    'custom',
    '{"setup_fee": 20.00, "price_per_piece": 0.01}',
    'Perforation service with custom positioning',
    'Add perforations to make tear-off sections. Setup fee plus per-piece charge.',
    1,
    true
) ON CONFLICT DO NOTHING;

-- 4. Score Only - $17.00 Fixed Fee + ($0.01 * Number of Scores)/piece
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options
) VALUES (
    'Score Only',
    'custom',
    '{"setup_fee": 17.00, "price_per_score_per_piece": 0.01}',
    'Scoring service for easy folding',
    'Score lines make folding easier and more professional. Price based on number of scores.',
    1,
    true
) ON CONFLICT DO NOTHING;

-- 5. Folding - Complex pricing based on paper type, 3 additional turnaround days
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options,
    admin_notes
) VALUES (
    'Folding',
    'custom',
    '{"text_paper": {"setup_fee": 0.17, "price_per_piece": 0.01}, "card_stock": {"setup_fee": 0.34, "price_per_piece": 0.02, "includes_basic_score": true}, "min_size": {"width": 5, "height": 6}}',
    'Professional folding service',
    'Professional folding service. Text paper and card stock have different pricing. Card stock includes mandatory basic scoring.',
    3,
    true,
    'Text Paper: $0.17 + $0.01/piece (folding only). Card Stock: $0.34 + $0.02/piece (includes mandatory basic score). Min print size 5x6.'
) ON CONFLICT DO NOTHING;

-- 6. Design Services - Multi-tier pricing structure
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options,
    admin_notes
) VALUES (
    'Design',
    'custom',
    '{"upload_artwork": {"price": 0, "turnaround_hours": 0}, "standard_one_side": {"price": 90.00, "turnaround_hours": 72}, "standard_two_sides": {"price": 135.00, "turnaround_hours": 72}, "rush_one_side": {"price": 160.00, "turnaround_hours": 36}, "rush_two_sides": {"price": 240.00, "turnaround_hours": 36}, "minor_changes": {"price": 22.50, "turnaround_hours": 24}, "major_changes": {"price": 45.00, "turnaround_hours": 48}}',
    'Custom design services',
    'Choose from upload your own artwork or custom design services. Design time is separate from print production.',
    0,
    true,
    'Design time is separate from print production. Upload My Artwork leads to file upload section.'
) ON CONFLICT DO NOTHING;

-- 7. Exact Size - +12.5% markup on Adjusted_Base_Price, 0 Additional Turnaround Days
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days
) VALUES (
    'Exact Size',
    'percentage',
    '{"markup_percentage": 12.5, "applies_to": "adjusted_base_price"}',
    'Exact size cutting service',
    'Cut to your exact specifications with precision. 12.5% markup on base price.',
    0
) ON CONFLICT DO NOTHING;

-- 8. Banding - $0.75/bundle
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options
) VALUES (
    'Banding',
    'custom',
    '{"price_per_bundle": 0.75, "default_items_per_bundle": 100}',
    'Banding service for bundled delivery',
    'Band your materials in bundles for easy distribution. Choose band type and bundle size.',
    1,
    true
) ON CONFLICT DO NOTHING;

-- 9. Shrink Wrapping - $0.30/bundle
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options
) VALUES (
    'Shrink Wrapping',
    'custom',
    '{"price_per_bundle": 0.30}',
    'Shrink wrapping for protection',
    'Protect your materials with shrink wrapping. Specify items per bundle.',
    1,
    true
) ON CONFLICT DO NOTHING;

-- 10. QR Code - $5.00 Fixed Fee, Admin manually creates from customer content
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options,
    admin_notes
) VALUES (
    'QR Code',
    'flat',
    '{"price": 5.00, "admin_generated": true}',
    'QR Code generation and placement',
    'We will create and place a QR code on your design. You provide the content/URL.',
    0,
    true,
    'Admin manually creates QR code from customer content. No customer QR upload for this add-on.'
) ON CONFLICT DO NOTHING;

-- 11. Postal Delivery (DDU) - $30.00/box, For EDDM-eligible products
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    admin_notes
) VALUES (
    'Postal Delivery (DDU)',
    'custom',
    '{"price_per_box": 30.00, "eddm_only": true}',
    'Direct delivery to post office',
    'We deliver directly to the post office for EDDM campaigns. Price per shipping box.',
    1,
    'For EDDM-eligible products only. Printer handles post office delivery.'
) ON CONFLICT DO NOTHING;

-- 12. EDDM Process & Postage - $50.00 Fixed Fee + $0.239/piece
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options,
    admin_notes
) VALUES (
    'EDDM Process & Postage',
    'custom',
    '{"setup_fee": 50.00, "price_per_piece": 0.239, "mandatory_banding": true, "eddm_only": true}',
    'Complete EDDM processing and postage',
    'Full EDDM service including postage. Mandatory paper banding included in service.',
    2,
    true,
    'Mandatory Paper Banding auto-selected and costed. For EDDM-eligible products only.'
) ON CONFLICT DO NOTHING;

-- 13. Hole Drilling - $20.00 Fixed Fee + variable per-piece based on holes
INSERT INTO public.add_ons (
    name, 
    pricing_model, 
    configuration, 
    description, 
    tooltip_text,
    additional_turnaround_days,
    has_sub_options
) VALUES (
    'Hole Drilling',
    'custom',
    '{"setup_fee": 20.00, "custom_holes_price_per_hole_per_piece": 0.02, "binder_punch_price_per_piece": 0.01}',
    'Hole drilling service',
    'Add holes for binding or hanging. Custom holes 1-5 add $0.02 per hole per piece. Binder punch options add $0.01 per piece.',
    1,
    true
) ON CONFLICT DO NOTHING;

-- Now add sub-options for complex add-ons

-- Perforation sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, display_order) 
SELECT 
    a.id,
    'Number of Perforations',
    'dropdown',
    '["Vertical", "Horizontal"]'::jsonb,
    'Choose vertical or horizontal perforation orientation',
    1
FROM public.add_ons a WHERE a.name = 'Perforation';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, display_order) 
SELECT 
    a.id,
    'Perforation Position',
    'text_input',
    NULL,
    'Specify where you want the perforation placed (e.g., "2 inches from left edge")',
    2
FROM public.add_ons a WHERE a.name = 'Perforation';

-- Score Only sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, affects_pricing, display_order) 
SELECT 
    a.id,
    'How many scores',
    'dropdown',
    '["1", "2", "3", "4", "5"]'::jsonb,
    'Number of score lines needed',
    true,
    1
FROM public.add_ons a WHERE a.name = 'Score Only';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, display_order) 
SELECT 
    a.id,
    'Score Position',
    'text_input',
    NULL,
    'Specify where you want each score placed (e.g., "3.5 inches from left, 7 inches from left")',
    2
FROM public.add_ons a WHERE a.name = 'Score Only';

-- Folding sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, display_order) 
SELECT 
    a.id,
    'Fold Type',
    'dropdown',
    '["Half Fold", "Tri Fold", "Z Fold", "Gate Fold", "Double Parallel Fold", "Roll Fold"]'::jsonb,
    'Choose the type of fold for your project',
    1
FROM public.add_ons a WHERE a.name = 'Folding';

-- Design sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, affects_pricing, display_order) 
SELECT 
    a.id,
    'Design Service Type',
    'dropdown',
    '["Upload My Artwork", "Standard Custom Design", "Rush Custom Design", "Design Changes - Minor", "Design Changes - Major"]'::jsonb,
    'Choose your design service level',
    true,
    1
FROM public.add_ons a WHERE a.name = 'Design';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, affects_pricing, display_order) 
SELECT 
    a.id,
    'Number of Sides',
    'dropdown',
    '["One Side", "Two Sides"]'::jsonb,
    'Choose how many sides need design work (applies to Standard and Rush Custom Design only)',
    true,
    2
FROM public.add_ons a WHERE a.name = 'Design';

-- Banding sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, default_value, tooltip_text, display_order) 
SELECT 
    a.id,
    'Banding Type',
    'dropdown',
    '["Paper Bands", "Rubber Bands"]'::jsonb,
    'Paper Bands',
    'Choose the type of banding material (no price difference)',
    1
FROM public.add_ons a WHERE a.name = 'Banding';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, default_value, tooltip_text, display_order) 
SELECT 
    a.id,
    'Items per Bundle',
    'number_input',
    '100',
    'How many items per bundle (default 100)',
    2
FROM public.add_ons a WHERE a.name = 'Banding';

-- Shrink Wrapping sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, tooltip_text, display_order) 
SELECT 
    a.id,
    'Items per Bundle',
    'text_input',
    'How many items to shrink wrap together',
    1
FROM public.add_ons a WHERE a.name = 'Shrink Wrapping';

-- QR Code sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, tooltip_text, is_required, display_order) 
SELECT 
    a.id,
    'Code Content',
    'text_input',
    'Enter the URL or text content for your QR code',
    true,
    1
FROM public.add_ons a WHERE a.name = 'QR Code';

-- EDDM Process & Postage sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, default_value, tooltip_text, display_order) 
SELECT 
    a.id,
    'Route Selection',
    'dropdown',
    '["Let Us Select Routes", "I Will Provide Routes"]'::jsonb,
    'Let Us Select Routes',
    'Choose how EDDM routes will be selected',
    1
FROM public.add_ons a WHERE a.name = 'EDDM Process & Postage';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, tooltip_text, display_order) 
SELECT 
    a.id,
    'Route Information',
    'text_input',
    'If providing your own routes, enter route details or indicate you will upload/contact us',
    2
FROM public.add_ons a WHERE a.name = 'EDDM Process & Postage';

-- Hole Drilling sub-options
INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, affects_pricing, display_order) 
SELECT 
    a.id,
    'Number of Holes',
    'dropdown',
    '["1", "2", "3", "4", "5", "3-Hole Binder Punch", "2-Hole Binder Punch"]'::jsonb,
    'Choose number of custom holes (1-5) or binder punch option',
    true,
    1
FROM public.add_ons a WHERE a.name = 'Hole Drilling';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, options, tooltip_text, display_order) 
SELECT 
    a.id,
    'Size of Holes',
    'dropdown',
    '["1/8 inch", "1/4 inch", "3/8 inch", "1/2 inch"]'::jsonb,
    'Choose the diameter of the holes (no price impact)',
    2
FROM public.add_ons a WHERE a.name = 'Hole Drilling';

INSERT INTO public.add_on_sub_options (add_on_id, name, option_type, tooltip_text, display_order) 
SELECT 
    a.id,
    'Position of Holes',
    'text_input',
    'Specify where holes should be placed (e.g., "0.5 inch from left edge, centered vertically")',
    3
FROM public.add_ons a WHERE a.name = 'Hole Drilling';

COMMENT ON TABLE public.add_ons IS 'Exact add-ons from documentation with precise pricing and configuration';
COMMENT ON TABLE public.add_on_sub_options IS 'Sub-options for complex add-ons as specified in documentation';