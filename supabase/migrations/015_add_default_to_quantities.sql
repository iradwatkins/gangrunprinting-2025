-- Add default quantity selection and sorting to quantities table
-- This enhancement allows marking one quantity as default and better organization
-- ZERO impact on existing pricing calculations

-- Add is_default field to quantities table
ALTER TABLE public.quantities 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Add sort_order field for better organization
ALTER TABLE public.quantities 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create unique constraint to ensure only one default quantity
CREATE UNIQUE INDEX IF NOT EXISTS idx_quantities_single_default 
ON public.quantities (is_default) 
WHERE is_default = true;

-- Update sort_order based on existing value field for better organization
UPDATE public.quantities 
SET sort_order = COALESCE(value, 999999) 
WHERE sort_order = 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quantities_sort_order ON public.quantities(sort_order);
CREATE INDEX IF NOT EXISTS idx_quantities_default ON public.quantities(is_default);