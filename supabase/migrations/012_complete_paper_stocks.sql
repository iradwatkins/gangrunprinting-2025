-- Add missing fields to paper_stocks table for complete paper stock configuration

-- Add sides configuration fields
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS single_sided_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS double_sided_available BOOLEAN DEFAULT true;

-- Add tooltip fields for customer-facing text
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS sides_tooltip_text TEXT;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS coatings_tooltip_text TEXT;

-- Update existing paper stocks to have default values
UPDATE public.paper_stocks 
SET single_sided_available = true 
WHERE single_sided_available IS NULL;

UPDATE public.paper_stocks 
SET double_sided_available = true 
WHERE double_sided_available IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.paper_stocks.single_sided_available IS 'Whether single-sided printing is available for this paper';
COMMENT ON COLUMN public.paper_stocks.double_sided_available IS 'Whether double-sided printing is available for this paper';
COMMENT ON COLUMN public.paper_stocks.sides_tooltip_text IS 'Customer-facing tooltip text explaining sides options for this paper';
COMMENT ON COLUMN public.paper_stocks.coatings_tooltip_text IS 'Customer-facing tooltip text explaining coating options for this paper';