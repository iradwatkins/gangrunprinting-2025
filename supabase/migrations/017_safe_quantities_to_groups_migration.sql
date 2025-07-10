-- Safe migration from individual quantities to quantity groups
-- This preserves existing data and adds new columns

-- Add new columns for quantity groups
ALTER TABLE public.quantities 
ADD COLUMN IF NOT EXISTS values TEXT,
ADD COLUMN IF NOT EXISTS default_value INTEGER,
ADD COLUMN IF NOT EXISTS has_custom BOOLEAN DEFAULT false;

-- Update existing data to work with new structure
-- Convert individual quantities to simple groups
UPDATE public.quantities 
SET 
    values = CASE 
        WHEN is_custom = true THEN 'custom'
        ELSE value::text
    END,
    default_value = CASE 
        WHEN is_custom = false THEN value
        ELSE NULL
    END,
    has_custom = is_custom
WHERE values IS NULL;

-- Create some default quantity groups if they don't exist
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) 
SELECT 'Small Orders', '1,2,3,4,5,6,7,8,9,10,custom', 5, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.quantities WHERE name = 'Small Orders');

INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) 
SELECT 'Standard Print Runs', '25,50,100,250,500,custom', 100, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.quantities WHERE name = 'Standard Print Runs');

INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) 
SELECT 'Bulk Orders', '1000,2500,5000,10000,custom', 1000, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.quantities WHERE name = 'Bulk Orders');

INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) 
SELECT 'Business Cards', '250,500,1000,2500,5000', 500, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.quantities WHERE name = 'Business Cards');

INSERT INTO public.quantities (name, values, default_value, has_custom, is_active) 
SELECT 'Postcards', '100,250,500,1000,2500,5000', 500, false, true
WHERE NOT EXISTS (SELECT 1 FROM public.quantities WHERE name = 'Postcards');