-- Create product_categories table with hierarchical support
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    default_broker_discount DECIMAL(5,2) DEFAULT 0.00,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create vendors table for print suppliers
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB,
    incoming_email_addresses JSONB DEFAULT '[]',
    supported_shipping_carriers JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create products table with category and vendor relationships
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE RESTRICT,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    minimum_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create updated_at triggers
CREATE TRIGGER product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER vendors_updated_at
    BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for product catalog (public read access)
CREATE POLICY "Public can view active categories" ON public.product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Admin-only access for vendors
CREATE POLICY "Admin can manage vendors" ON public.vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

-- Admin-only write access for categories and products
CREATE POLICY "Admin can manage categories" ON public.product_categories
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can update categories" ON public.product_categories
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can manage products" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can update products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON public.product_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON public.product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON public.product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON public.vendors(is_active);