-- Enhance product system to match documentation specifications exactly
-- This migration adds the missing fields and tables required by the documentation

-- Add 2nd side markup to paper_stocks (required by documentation)
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS second_side_markup_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS default_coating_id UUID REFERENCES public.coatings(id);

-- Add custom size support to print_sizes
ALTER TABLE public.print_sizes
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS min_width DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS max_width DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS min_height DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS max_height DECIMAL(8,2);

-- Add tooltips table for all customer-facing options
CREATE TABLE IF NOT EXISTS public.tooltips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'sides', 'paper', 'coating', 'print_size', 'quantity', 'turnaround_time', 'add_on'
    entity_id UUID, -- reference to the specific item, NULL for general tooltips
    tooltip_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add quantities table for global standard tiers
CREATE TABLE IF NOT EXISTS public.quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., "250", "500", "1000", "Custom..."
    value INTEGER, -- NULL for custom
    is_custom BOOLEAN NOT NULL DEFAULT false,
    min_custom_value INTEGER DEFAULT 5000, -- Minimum for custom quantities
    increment_value INTEGER DEFAULT 5000, -- Must be multiples of this
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sides table for printing sides configuration
CREATE TABLE IF NOT EXISTS public.sides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., "Single Sided", "Double Sided (4/4)"
    multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00, -- Factor for pricing calculation
    tooltip_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enhanced add_ons table for complex configurations
-- Add fields for sub-options and dependencies
ALTER TABLE public.add_ons 
ADD COLUMN IF NOT EXISTS additional_turnaround_days INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_sub_options BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS depends_on_add_on_id UUID REFERENCES public.add_ons(id),
ADD COLUMN IF NOT EXISTS tooltip_text TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create add_on_sub_options table for complex add-ons like Perforation, Score, etc.
CREATE TABLE IF NOT EXISTS public.add_on_sub_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    add_on_id UUID NOT NULL REFERENCES public.add_ons(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Number of Holes", "Score Position"
    option_type TEXT NOT NULL, -- 'dropdown', 'number_input', 'text_input', 'checkbox'
    options JSONB, -- For dropdown options: ["1", "2", "3", "4", "5"] or ["Vertical", "Horizontal"]
    default_value TEXT,
    tooltip_text TEXT,
    affects_pricing BOOLEAN NOT NULL DEFAULT false,
    pricing_configuration JSONB, -- How this sub-option affects pricing
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add EDDM support to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_eddm_eligible BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS min_fold_width DECIMAL(8,2), -- For folding minimum size requirements
ADD COLUMN IF NOT EXISTS min_fold_height DECIMAL(8,2);

-- Create turnaround_time_base_descriptions table for dynamic timeframe descriptions
CREATE TABLE IF NOT EXISTS public.turnaround_base_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turnaround_time_id UUID NOT NULL REFERENCES public.turnaround_times(id) ON DELETE CASCADE,
    base_description TEXT NOT NULL, -- e.g., "Standard: 5-7 business days"
    tooltip_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update triggers for new tables
CREATE TRIGGER tooltips_updated_at
    BEFORE UPDATE ON public.tooltips
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER quantities_updated_at
    BEFORE UPDATE ON public.quantities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER sides_updated_at
    BEFORE UPDATE ON public.sides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER add_on_sub_options_updated_at
    BEFORE UPDATE ON public.add_on_sub_options
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER turnaround_base_descriptions_updated_at
    BEFORE UPDATE ON public.turnaround_base_descriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for new tables
ALTER TABLE public.tooltips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_on_sub_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnaround_base_descriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Public can view active tooltips" ON public.tooltips
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active quantities" ON public.quantities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active sides" ON public.sides
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active sub-options" ON public.add_on_sub_options
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view turnaround descriptions" ON public.turnaround_base_descriptions
    FOR SELECT USING (true);

-- Admin policies for new tables
CREATE POLICY "Admin can manage tooltips" ON public.tooltips
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage quantities" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage sides" ON public.sides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage sub-options" ON public.add_on_sub_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage turnaround descriptions" ON public.turnaround_base_descriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tooltips_entity ON public.tooltips(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
CREATE INDEX IF NOT EXISTS idx_sides_active ON public.sides(is_active);
CREATE INDEX IF NOT EXISTS idx_sub_options_addon ON public.add_on_sub_options(add_on_id);
CREATE INDEX IF NOT EXISTS idx_turnaround_descriptions_time ON public.turnaround_base_descriptions(turnaround_time_id);
CREATE INDEX IF NOT EXISTS idx_products_eddm ON public.products(is_eddm_eligible);

-- Add foreign key constraint for paper stock default coating
CREATE INDEX IF NOT EXISTS idx_paper_stocks_default_coating ON public.paper_stocks(default_coating_id);

COMMENT ON TABLE public.tooltips IS 'Stores all customer-facing tooltips as specified in documentation';
COMMENT ON TABLE public.quantities IS 'Global quantity tiers with custom option support (min 5,000, multiples of 5,000)';
COMMENT ON TABLE public.sides IS 'Printing sides configuration with pricing multipliers for 2nd side markup';
COMMENT ON TABLE public.add_on_sub_options IS 'Sub-options for complex add-ons like Perforation, Score, Folding, etc.';
COMMENT ON COLUMN public.paper_stocks.second_side_markup_percent IS 'Documentation requirement: 2nd Side Markup % for double-sided printing';
COMMENT ON COLUMN public.products.is_eddm_eligible IS 'Documentation requirement: Flag for EDDM-eligible products';