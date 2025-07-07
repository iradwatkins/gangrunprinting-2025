-- Add missing fields to paper_stocks table per documentation requirements

-- Add second side markup percentage field
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS second_side_markup_percent DECIMAL(5,2) DEFAULT 80.00;

-- Add tooltip text field for customer-facing descriptions
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS tooltip_text TEXT;

-- Add sort_order field for admin ordering
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing paper stocks to have realistic second side markup values
UPDATE public.paper_stocks 
SET second_side_markup_percent = 80.00 
WHERE second_side_markup_percent IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.paper_stocks.second_side_markup_percent IS 'Percentage markup for double-sided printing (typically 80% for 1.8x multiplier)';
COMMENT ON COLUMN public.paper_stocks.tooltip_text IS 'Customer-facing tooltip text explaining the paper stock';
COMMENT ON COLUMN public.paper_stocks.sort_order IS 'Display order in admin interface and customer selection';