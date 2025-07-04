-- Create order status enum
CREATE TYPE order_status AS ENUM (
    'draft',
    'pending_payment', 
    'payment_confirmed',
    'in_production',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

-- Create job status enum
CREATE TYPE job_status AS ENUM (
    'pending',
    'assigned',
    'in_production', 
    'printing',
    'finishing',
    'quality_check',
    'shipped',
    'delivered',
    'cancelled'
);

-- Create orders table with user relationships and JSONB address storage
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    reference_number TEXT NOT NULL UNIQUE, -- GRP-12345 format
    status order_status NOT NULL DEFAULT 'draft',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Address snapshots for historical accuracy
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    
    -- Payment information
    payment_method TEXT,
    payment_id TEXT, -- External payment processor ID
    payment_status TEXT,
    
    -- Order metadata
    notes TEXT,
    special_instructions TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_jobs table with product configurations and pricing snapshots
CREATE TABLE IF NOT EXISTS public.order_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Configuration snapshot at time of order
    configuration JSONB NOT NULL DEFAULT '{}',
    
    -- Pricing breakdown snapshot for transparency
    price_summary JSONB NOT NULL DEFAULT '{}',
    
    -- Job specific tracking
    status job_status NOT NULL DEFAULT 'pending',
    tracking_number TEXT,
    estimated_delivery DATE,
    actual_delivery TIMESTAMPTZ,
    
    -- File attachments
    artwork_files JSONB DEFAULT '[]', -- Array of file references
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
    new_ref TEXT;
    ref_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate GRP-##### format
        new_ref := 'GRP-' || LPAD((FLOOR(RANDOM() * 99999) + 1)::TEXT, 5, '0');
        
        -- Check if reference already exists
        SELECT EXISTS(SELECT 1 FROM public.orders WHERE reference_number = new_ref) INTO ref_exists;
        
        -- If unique, break the loop
        IF NOT ref_exists THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
        NEW.reference_number := generate_reference_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_set_reference_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION set_reference_number();

-- Create updated_at triggers
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER order_jobs_updated_at
    BEFORE UPDATE ON public.order_jobs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for orders (users can only access their own)
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for order_jobs (linked to user's orders)
CREATE POLICY "Users can view own order jobs" ON public.order_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_jobs.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own order jobs" ON public.order_jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_jobs.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own order jobs" ON public.order_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_jobs.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admin policies for order management
CREATE POLICY "Admin can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can update all orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can view all order jobs" ON public.order_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );

CREATE POLICY "Admin can update all order jobs" ON public.order_jobs
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
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_reference_number ON public.orders(reference_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_jobs_order_id ON public.order_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_jobs_product_id ON public.order_jobs(product_id);
CREATE INDEX IF NOT EXISTS idx_order_jobs_vendor_id ON public.order_jobs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_jobs_status ON public.order_jobs(status);
CREATE INDEX IF NOT EXISTS idx_order_jobs_tracking_number ON public.order_jobs(tracking_number);