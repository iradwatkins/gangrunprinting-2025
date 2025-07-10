-- Add vendor email functionality
-- Migration: 013_add_vendor_email_functionality

-- Create vendor_email_log table for tracking email communications
CREATE TABLE vendor_email_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_vendor_email_log_vendor_id ON vendor_email_log(vendor_id);
CREATE INDEX idx_vendor_email_log_status ON vendor_email_log(status);
CREATE INDEX idx_vendor_email_log_created_at ON vendor_email_log(created_at);

-- Update vendors table to ensure contact information fields exist
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create updated_at trigger for vendor_email_log
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_email_log_updated_at 
    BEFORE UPDATE ON vendor_email_log 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security) for vendor_email_log
ALTER TABLE vendor_email_log ENABLE ROW LEVEL SECURITY;

-- Ensure is_admin column exists on user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create RLS policies for vendor_email_log
-- Admin users can access all vendor email logs
DROP POLICY IF EXISTS "Admin users can access vendor email logs" ON vendor_email_log;
CREATE POLICY "Admin users can access vendor email logs" ON vendor_email_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.is_admin = true
        )
    );

-- Update the vendors table RLS policy if it doesn't exist
DO $$
BEGIN
    -- Check if the policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'vendors' 
        AND policyname = 'Admin users can access vendors'
    ) THEN
        -- Create the policy
        CREATE POLICY "Admin users can access vendors" ON vendors
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM user_profiles 
                    WHERE user_profiles.user_id = auth.uid() 
                    AND user_profiles.is_admin = true
                )
            );
    END IF;
END
$$;

-- Add comments for documentation
COMMENT ON TABLE vendor_email_log IS 'Logs all email communications sent to vendors';
COMMENT ON COLUMN vendor_email_log.vendor_id IS 'Reference to the vendor who received the email';
COMMENT ON COLUMN vendor_email_log.to_email IS 'Email address where the message was sent';
COMMENT ON COLUMN vendor_email_log.subject IS 'Email subject line';
COMMENT ON COLUMN vendor_email_log.body IS 'Email message content';
COMMENT ON COLUMN vendor_email_log.status IS 'Email delivery status: pending, sent, or failed';
COMMENT ON COLUMN vendor_email_log.error_message IS 'Error message if email delivery failed';
COMMENT ON COLUMN vendor_email_log.sent_at IS 'Timestamp when email was successfully sent';

COMMENT ON COLUMN vendors.contact_email IS 'Primary email address for vendor communication';
COMMENT ON COLUMN vendors.contact_phone IS 'Primary phone number for vendor';
COMMENT ON COLUMN vendors.contact_name IS 'Primary contact person name';
COMMENT ON COLUMN vendors.rating IS 'Vendor performance rating (0.0 to 5.0)';
COMMENT ON COLUMN vendors.capabilities IS 'JSON object containing vendor capabilities and specialties';
COMMENT ON COLUMN vendors.notes IS 'Internal notes about the vendor';