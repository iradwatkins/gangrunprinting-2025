-- Add missing quantities and sides tables for global options

-- Create quantities table
CREATE TABLE IF NOT EXISTS public.quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    value INTEGER, -- NULL for custom quantities
    is_custom BOOLEAN NOT NULL DEFAULT false,
    min_custom_value INTEGER, -- For custom quantities
    increment_value INTEGER, -- For custom quantities
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sides table
CREATE TABLE IF NOT EXISTS public.sides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    multiplier DECIMAL(8,4) NOT NULL DEFAULT 1.0000, -- Price multiplier
    tooltip_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at triggers
CREATE TRIGGER quantities_updated_at
    BEFORE UPDATE ON public.quantities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER sides_updated_at
    BEFORE UPDATE ON public.sides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sides ENABLE ROW LEVEL SECURITY;

-- Create policies for quantities (public read access for active items)
CREATE POLICY "Public can view active quantities" ON public.quantities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active sides" ON public.sides
    FOR SELECT USING (is_active = true);

-- Admin-only write access for quantities
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

-- Admin-only write access for sides
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
CREATE INDEX IF NOT EXISTS idx_sides_active ON public.sides(is_active);

-- Insert some default quantities
INSERT INTO public.quantities (name, value, is_custom, is_active) VALUES 
    ('25', 25, false, true),
    ('50', 50, false, true),
    ('100', 100, false, true),
    ('250', 250, false, true),
    ('500', 500, false, true),
    ('1000', 1000, false, true),
    ('2500', 2500, false, true),
    ('5000', 5000, false, true),
    ('10000', 10000, false, true),
    ('Custom', NULL, true, true)
ON CONFLICT DO NOTHING;

-- Insert some default sides
INSERT INTO public.sides (name, multiplier, tooltip_text, is_active) VALUES 
    ('Single Sided', 1.0000, 'Print on one side only', true),
    ('Double Sided', 1.8000, 'Print on both sides (front and back)', true)
ON CONFLICT DO NOTHING;