-- Enhance paper_stocks table with specific sides options and markups
-- This migration replaces the basic single/double sided options with specific side types

-- Add new enhanced sides option fields
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS different_image_both_sides_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS different_image_both_sides_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS same_image_both_sides_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS same_image_both_sides_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS image_front_only_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS image_front_only_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS your_design_front_our_back_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS your_design_front_our_back_markup DECIMAL(5,2) DEFAULT 1.00;

-- Update existing paper stocks to have default values for new fields
UPDATE public.paper_stocks 
SET 
  different_image_both_sides_available = true,
  different_image_both_sides_markup = 1.00,
  same_image_both_sides_available = true,
  same_image_both_sides_markup = 1.00,
  image_front_only_available = true,
  image_front_only_markup = 1.00,
  your_design_front_our_back_available = true,
  your_design_front_our_back_markup = 1.00
WHERE 
  different_image_both_sides_available IS NULL 
  OR same_image_both_sides_available IS NULL 
  OR image_front_only_available IS NULL 
  OR your_design_front_our_back_available IS NULL;

-- Add enhanced coating option fields
ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS high_gloss_uv_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS high_gloss_uv_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS high_gloss_uv_one_side_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS high_gloss_uv_one_side_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS gloss_aqueous_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS gloss_aqueous_markup DECIMAL(5,2) DEFAULT 1.00;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS matte_aqueous_available BOOLEAN DEFAULT true;

ALTER TABLE public.paper_stocks 
ADD COLUMN IF NOT EXISTS matte_aqueous_markup DECIMAL(5,2) DEFAULT 1.00;

-- Update existing paper stocks to have default values for new coating fields
UPDATE public.paper_stocks 
SET 
  high_gloss_uv_available = true,
  high_gloss_uv_markup = 1.00,
  high_gloss_uv_one_side_available = true,
  high_gloss_uv_one_side_markup = 1.00,
  gloss_aqueous_available = true,
  gloss_aqueous_markup = 1.00,
  matte_aqueous_available = true,
  matte_aqueous_markup = 1.00
WHERE 
  high_gloss_uv_available IS NULL 
  OR high_gloss_uv_one_side_available IS NULL 
  OR gloss_aqueous_available IS NULL 
  OR matte_aqueous_available IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.paper_stocks.different_image_both_sides_available IS 'Whether "Different Image Both Sides (2 Sided)" option is available';
COMMENT ON COLUMN public.paper_stocks.different_image_both_sides_markup IS 'Markup percentage for different image both sides option';
COMMENT ON COLUMN public.paper_stocks.same_image_both_sides_available IS 'Whether "Same Image Both Sides (2 Sided)" option is available';
COMMENT ON COLUMN public.paper_stocks.same_image_both_sides_markup IS 'Markup percentage for same image both sides option';
COMMENT ON COLUMN public.paper_stocks.image_front_only_available IS 'Whether "Image Front Side Only (1 Sided)" option is available';
COMMENT ON COLUMN public.paper_stocks.image_front_only_markup IS 'Markup percentage for front side only option';
COMMENT ON COLUMN public.paper_stocks.your_design_front_our_back_available IS 'Whether "Your Design Front / Our Design Back" option is available';
COMMENT ON COLUMN public.paper_stocks.your_design_front_our_back_markup IS 'Markup percentage for your design front / our design back option';
COMMENT ON COLUMN public.paper_stocks.high_gloss_uv_available IS 'Whether "High Gloss UV" coating option is available';
COMMENT ON COLUMN public.paper_stocks.high_gloss_uv_markup IS 'Markup percentage for high gloss UV coating option';
COMMENT ON COLUMN public.paper_stocks.high_gloss_uv_one_side_available IS 'Whether "High Gloss UV on ONE SIDE" coating option is available';
COMMENT ON COLUMN public.paper_stocks.high_gloss_uv_one_side_markup IS 'Markup percentage for high gloss UV one side coating option';
COMMENT ON COLUMN public.paper_stocks.gloss_aqueous_available IS 'Whether "Gloss Aqueous" coating option is available';
COMMENT ON COLUMN public.paper_stocks.gloss_aqueous_markup IS 'Markup percentage for gloss aqueous coating option';
COMMENT ON COLUMN public.paper_stocks.matte_aqueous_available IS 'Whether "Matte Aqueous" coating option is available';
COMMENT ON COLUMN public.paper_stocks.matte_aqueous_markup IS 'Markup percentage for matte aqueous coating option';