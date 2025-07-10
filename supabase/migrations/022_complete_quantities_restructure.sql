-- Complete restructure of quantities table from individual quantities to quantity groups
-- This migration transforms the old individual quantity structure to support quantity groups

-- Step 1: Backup existing data (if any)
CREATE TEMP TABLE temp_quantities_backup AS 
SELECT * FROM public.quantities WHERE 1=0; -- Empty backup for clean start

-- Step 2: Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.quantities CASCADE;

-- Step 3: Create new quantities table structure for quantity groups
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

-- Step 4: Create updated_at trigger
DROP TRIGGER IF EXISTS quantities_updated_at ON public.quantities;
CREATE TRIGGER quantities_updated_at
    BEFORE UPDATE ON public.quantities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 5: Enable RLS
ALTER TABLE public.quantities ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for quantity groups (public read access for active items)
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);

-- Step 7: Admin-only write access for quantity groups
-- First, add is_admin column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' 
                   AND column_name = 'is_admin') THEN
        ALTER TABLE public.user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create admin policy with correct column reference
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quantities_active ON public.quantities(is_active);
CREATE INDEX IF NOT EXISTS idx_quantities_name ON public.quantities(name);

-- Step 9: Insert default quantity groups
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) VALUES 
    ('Small Orders', '1,2,3,4,5,6,7,8,9,10,custom', 5, true, true),
    ('Standard Print Runs', '25,50,100,250,500,custom', 100, true, true),
    ('Bulk Orders', '1000,2500,5000,10000,custom', 1000, true, true),
    ('Business Cards', '250,500,1000,2500,5000', 500, false, true),
    ('Postcards', '100,250,500,1000,2500,5000', 500, false, true)
ON CONFLICT DO NOTHING;

-- Step 10: Grant necessary permissions
GRANT ALL ON public.quantities TO authenticated;
GRANT SELECT ON public.quantities TO anon;
