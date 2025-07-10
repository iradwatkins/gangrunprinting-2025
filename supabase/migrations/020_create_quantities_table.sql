-- Create quantities table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quantities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    values TEXT NOT NULL,
    default_value INTEGER,
    has_custom BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create or replace the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
DROP TRIGGER IF EXISTS quantities_updated_at ON public.quantities;
CREATE TRIGGER quantities_updated_at
    BEFORE UPDATE ON public.quantities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

-- Create policies with correct admin check
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
CREATE INDEX IF NOT EXISTS idx_quantities_name ON public.quantities(name);

-- Insert default quantity groups (only if table is empty)
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active)
SELECT * FROM (VALUES 
    ('Small Orders', '1,2,3,4,5,6,7,8,9,10,custom', 5, true, true),
    ('Standard Print Runs', '25,50,100,250,500,custom', 100, true, true),
    ('Bulk Orders', '1000,2500,5000,10000,custom', 1000, true, true),
    ('Business Cards', '250,500,1000,2500,5000', 500, false, true),
    ('Postcards', '100,250,500,1000,2500,5000', 500, false, true)
) AS defaults(name, values, default_value, has_custom, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.quantities LIMIT 1);

-- Grant necessary permissions
GRANT ALL ON public.quantities TO authenticated;
GRANT SELECT ON public.quantities TO anon;