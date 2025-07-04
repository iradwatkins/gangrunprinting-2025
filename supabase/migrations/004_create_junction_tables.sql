-- Create paper_stock_coatings junction table
CREATE TABLE IF NOT EXISTS public.paper_stock_coatings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_stock_id UUID NOT NULL REFERENCES public.paper_stocks(id) ON DELETE CASCADE,
    coating_id UUID NOT NULL REFERENCES public.coatings(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(paper_stock_id, coating_id)
);

-- Create product_paper_stocks junction table
CREATE TABLE IF NOT EXISTS public.product_paper_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    paper_stock_id UUID NOT NULL REFERENCES public.paper_stocks(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    price_override DECIMAL(12,8), -- Optional price override for this product
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, paper_stock_id)
);

-- Create product_print_sizes junction table
CREATE TABLE IF NOT EXISTS public.product_print_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    print_size_id UUID NOT NULL REFERENCES public.print_sizes(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    price_modifier DECIMAL(8,4) DEFAULT 0.0000, -- Size-specific price modifier
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, print_size_id)
);

-- Create product_turnaround_times junction table
CREATE TABLE IF NOT EXISTS public.product_turnaround_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    turnaround_time_id UUID NOT NULL REFERENCES public.turnaround_times(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    price_override DECIMAL(5,2), -- Optional price override for this product
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, turnaround_time_id)
);

-- Create product_add_ons junction table
CREATE TABLE IF NOT EXISTS public.product_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    add_on_id UUID NOT NULL REFERENCES public.add_ons(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT false,
    price_override JSONB, -- Optional price override configuration for this product
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, add_on_id)
);

-- Enable RLS for all junction tables
ALTER TABLE public.paper_stock_coatings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_paper_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_print_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_turnaround_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_add_ons ENABLE ROW LEVEL SECURITY;

-- Create policies for junction tables (public read access)
CREATE POLICY "Public can view paper stock coatings" ON public.paper_stock_coatings
    FOR SELECT USING (true);

CREATE POLICY "Public can view product paper stocks" ON public.product_paper_stocks
    FOR SELECT USING (true);

CREATE POLICY "Public can view product print sizes" ON public.product_print_sizes
    FOR SELECT USING (true);

CREATE POLICY "Public can view product turnaround times" ON public.product_turnaround_times
    FOR SELECT USING (true);

CREATE POLICY "Public can view product add-ons" ON public.product_add_ons
    FOR SELECT USING (true);

-- Admin-only write access for all junction tables
CREATE POLICY "Admin can manage paper stock coatings" ON public.paper_stock_coatings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage product paper stocks" ON public.product_paper_stocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage product print sizes" ON public.product_print_sizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage product turnaround times" ON public.product_turnaround_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage product add-ons" ON public.product_add_ons
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
CREATE INDEX IF NOT EXISTS idx_paper_stock_coatings_paper_id ON public.paper_stock_coatings(paper_stock_id);
CREATE INDEX IF NOT EXISTS idx_paper_stock_coatings_coating_id ON public.paper_stock_coatings(coating_id);

CREATE INDEX IF NOT EXISTS idx_product_paper_stocks_product_id ON public.product_paper_stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_paper_stocks_paper_id ON public.product_paper_stocks(paper_stock_id);

CREATE INDEX IF NOT EXISTS idx_product_print_sizes_product_id ON public.product_print_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_print_sizes_size_id ON public.product_print_sizes(print_size_id);

CREATE INDEX IF NOT EXISTS idx_product_turnaround_times_product_id ON public.product_turnaround_times(product_id);
CREATE INDEX IF NOT EXISTS idx_product_turnaround_times_time_id ON public.product_turnaround_times(turnaround_time_id);

CREATE INDEX IF NOT EXISTS idx_product_add_ons_product_id ON public.product_add_ons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_addon_id ON public.product_add_ons(add_on_id);