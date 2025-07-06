-- Create customer invoices table for admin-created orders
CREATE TABLE customer_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_company TEXT,
    customer_phone TEXT,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    notes TEXT,
    payment_link TEXT,
    created_by_admin BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for fast lookups
CREATE INDEX idx_customer_invoices_invoice_number ON customer_invoices(invoice_number);
CREATE INDEX idx_customer_invoices_customer_email ON customer_invoices(customer_email);
CREATE INDEX idx_customer_invoices_status ON customer_invoices(status);
CREATE INDEX idx_customer_invoices_created_at ON customer_invoices(created_at);

-- Enable RLS
ALTER TABLE customer_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admins can do everything
CREATE POLICY "Admins can manage all invoices" ON customer_invoices
    FOR ALL USING (auth.jwt() ->> 'email' = 'iradwatkins@gmail.com');

-- Customers can view their own invoices
CREATE POLICY "Customers can view their own invoices" ON customer_invoices
    FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_invoices_updated_at
    BEFORE UPDATE ON customer_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_invoices_updated_at();