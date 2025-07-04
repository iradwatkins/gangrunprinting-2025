-- Create paper_stocks table with high precision pricing
CREATE TABLE IF NOT EXISTS public.paper_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    weight INTEGER NOT NULL, -- GSM
    price_per_sq_inch DECIMAL(12,8) NOT NULL DEFAULT 0.00000000,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coatings table with price modifiers
CREATE TABLE IF NOT EXISTS public.coatings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_modifier DECIMAL(8,4) NOT NULL DEFAULT 0.0000, -- Percentage modifier
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create print_sizes table with dimensions
CREATE TABLE IF NOT EXISTS public.print_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., "4x6", "8.5x11"
    width DECIMAL(8,2) NOT NULL, -- inches
    height DECIMAL(8,2) NOT NULL, -- inches
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create turnaround_times table with markup percentages
CREATE TABLE IF NOT EXISTS public.turnaround_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g., "Standard", "Rush", "Same Day"
    business_days INTEGER NOT NULL,
    price_markup_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create add_ons table with flexible JSONB pricing configuration
CREATE TYPE pricing_model AS ENUM ('flat', 'percentage', 'per_unit', 'per_sq_inch', 'custom');

CREATE TABLE IF NOT EXISTS public.add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pricing_model pricing_model NOT NULL DEFAULT 'flat',
    configuration JSONB NOT NULL DEFAULT '{}', -- Flexible pricing configuration
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at triggers
CREATE TRIGGER paper_stocks_updated_at
    BEFORE UPDATE ON public.paper_stocks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER coatings_updated_at
    BEFORE UPDATE ON public.coatings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER print_sizes_updated_at
    BEFORE UPDATE ON public.print_sizes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER turnaround_times_updated_at
    BEFORE UPDATE ON public.turnaround_times
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER add_ons_updated_at
    BEFORE UPDATE ON public.add_ons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.paper_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coatings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnaround_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.add_ons ENABLE ROW LEVEL SECURITY;

-- Create policies for global options (public read access for active items)
CREATE POLICY "Public can view active paper stocks" ON public.paper_stocks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active coatings" ON public.coatings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active print sizes" ON public.print_sizes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active turnaround times" ON public.turnaround_times
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active add-ons" ON public.add_ons
    FOR SELECT USING (is_active = true);

-- Admin-only write access for all global options
CREATE POLICY "Admin can manage paper stocks" ON public.paper_stocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage coatings" ON public.coatings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage print sizes" ON public.print_sizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage turnaround times" ON public.turnaround_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage add-ons" ON public.add_ons
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
CREATE INDEX IF NOT EXISTS idx_paper_stocks_active ON public.paper_stocks(is_active);
CREATE INDEX IF NOT EXISTS idx_coatings_active ON public.coatings(is_active);
CREATE INDEX IF NOT EXISTS idx_print_sizes_active ON public.print_sizes(is_active);
CREATE INDEX IF NOT EXISTS idx_turnaround_times_active ON public.turnaround_times(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_active ON public.add_ons(is_active);