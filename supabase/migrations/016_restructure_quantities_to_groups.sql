-- Restructure quantities table to support quantity groups
-- This changes from individual quantities to reusable quantity groups

-- First backup existing data
CREATE TEMP TABLE temp_quantities_backup AS 
SELECT * FROM public.quantities;

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.quantities CASCADE;

CREATE TABLE public.quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Group name (e.g., "Small Orders", "Standard Print Runs")
    values TEXT NOT NULL, -- Comma-separated values (e.g., "25,50,100,250,500,custom")
    default_value INTEGER, -- Which value appears first (e.g., 100)
    has_custom BOOLEAN DEFAULT false, -- Whether "custom" option is included
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at trigger
CREATE TRIGGER quantities_updated_at
    BEFORE UPDATE ON public.quantities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;

-- Create policies for quantity groups (public read access for active items)
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);

-- Admin-only write access for quantity groups
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
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
CREATE INDEX IF NOT EXISTS idx_quantities_name ON public.quantities(name);

-- Insert default quantity groups
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) VALUES 
    ('Small Orders', '1,2,3,4,5,6,7,8,9,10,custom', 5, true, true),
    ('Standard Print Runs', '25,50,100,250,500,custom', 100, true, true),
    ('Bulk Orders', '1000,2500,5000,10000,custom', 1000, true, true),
    ('Business Cards', '250,500,1000,2500,5000', 500, false, true),
    ('Postcards', '100,250,500,1000,2500,5000', 500, false, true)
ON CONFLICT DO NOTHING;