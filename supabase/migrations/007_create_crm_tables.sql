-- Create CRM tables for Story 1.10: Customer Support and Communication System

-- Customer profiles table (extends user_profiles)
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_status VARCHAR(20) DEFAULT 'active' CHECK (customer_status IN ('active', 'inactive', 'prospect', 'churned')),
    lifecycle_stage VARCHAR(20) DEFAULT 'customer' CHECK (lifecycle_stage IN ('lead', 'customer', 'loyal', 'at_risk', 'lost')),
    customer_value DECIMAL(10,2) DEFAULT 0,
    lifetime_value DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    acquisition_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acquisition_source VARCHAR(100),
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'sms')),
    communication_preferences JSONB DEFAULT '{
        "email_notifications": true,
        "sms_notifications": false,
        "marketing_emails": true,
        "order_updates": true,
        "promotional_offers": true,
        "newsletter": true
    }',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer tags table
CREATE TABLE customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- hex color code
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
);

-- Customer segments table
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL DEFAULT '{}',
    auto_update BOOLEAN DEFAULT false,
    customer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
);

-- Customer tag assignments (many-to-many)
CREATE TABLE customer_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES customer_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, tag_id)
);

-- Customer segment assignments (many-to-many)
CREATE TABLE customer_segment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, segment_id)
);

-- Customer notes table
CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type VARCHAR(20) DEFAULT 'general' CHECK (note_type IN ('general', 'support', 'sales', 'billing')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer interactions table
CREATE TABLE customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('email', 'phone', 'chat', 'meeting', 'order')),
    subject VARCHAR(200) NOT NULL,
    description TEXT,
    outcome TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(30) DEFAULT 'general' CHECK (category IN ('order_issue', 'billing', 'technical', 'general')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Customer feedback table
CREATE TABLE customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    category VARCHAR(20) DEFAULT 'overall' CHECK (category IN ('product', 'service', 'shipping', 'overall')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email interactions table
CREATE TABLE email_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'replied')),
    template_id UUID,
    campaign_id UUID,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- Export requests table
CREATE TABLE export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_type VARCHAR(20) NOT NULL CHECK (export_type IN ('customers', 'segments', 'interactions', 'tickets')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'excel', 'pdf')),
    filters JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_status ON customer_profiles(customer_status);
CREATE INDEX idx_customer_profiles_lifecycle ON customer_profiles(lifecycle_stage);
CREATE INDEX idx_customer_profiles_acquisition ON customer_profiles(acquisition_date);

CREATE INDEX idx_customer_tag_assignments_customer ON customer_tag_assignments(customer_id);
CREATE INDEX idx_customer_tag_assignments_tag ON customer_tag_assignments(tag_id);

CREATE INDEX idx_customer_segment_assignments_customer ON customer_segment_assignments(customer_id);
CREATE INDEX idx_customer_segment_assignments_segment ON customer_segment_assignments(segment_id);

CREATE INDEX idx_customer_notes_customer ON customer_notes(customer_id);
CREATE INDEX idx_customer_notes_type ON customer_notes(note_type);
CREATE INDEX idx_customer_notes_created ON customer_notes(created_at);

CREATE INDEX idx_customer_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX idx_customer_interactions_type ON customer_interactions(interaction_type);
CREATE INDEX idx_customer_interactions_created ON customer_interactions(created_at);

CREATE INDEX idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at);

CREATE INDEX idx_customer_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_customer_feedback_category ON customer_feedback(category);
CREATE INDEX idx_customer_feedback_created ON customer_feedback(created_at);

CREATE INDEX idx_email_interactions_customer ON email_interactions(customer_id);
CREATE INDEX idx_email_interactions_direction ON email_interactions(direction);
CREATE INDEX idx_email_interactions_status ON email_interactions(status);
CREATE INDEX idx_email_interactions_sent ON email_interactions(sent_at);

CREATE INDEX idx_export_requests_status ON export_requests(status);
CREATE INDEX idx_export_requests_created ON export_requests(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at BEFORE UPDATE ON customer_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_notes_updated_at BEFORE UPDATE ON customer_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on specific requirements)
CREATE POLICY "Allow authenticated users to view customer profiles" ON customer_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer profiles" ON customer_profiles
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view customer tags" ON customer_tags
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer tags" ON customer_tags
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view customer segments" ON customer_segments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer segments" ON customer_segments
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage tag assignments" ON customer_tag_assignments
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage segment assignments" ON customer_segment_assignments
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view customer notes" ON customer_notes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer notes" ON customer_notes
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view customer interactions" ON customer_interactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer interactions" ON customer_interactions
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view support tickets" ON support_tickets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage support tickets" ON support_tickets
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view customer feedback" ON customer_feedback
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage customer feedback" ON customer_feedback
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view email interactions" ON email_interactions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage email interactions" ON email_interactions
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view export requests" ON export_requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to manage export requests" ON export_requests
    FOR ALL TO authenticated USING (true);

-- Create a function to sync customer profiles with user profiles
CREATE OR REPLACE FUNCTION sync_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Create customer profile when user profile is created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO customer_profiles (user_id, acquisition_date)
        VALUES (NEW.user_id, NOW())
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-create customer profiles
CREATE TRIGGER sync_customer_profile_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION sync_customer_profile();

-- Create function to update customer metrics
CREATE OR REPLACE FUNCTION update_customer_metrics(customer_user_id UUID)
RETURNS VOID AS $$
DECLARE
    total_orders_count INTEGER;
    total_spent DECIMAL(10,2);
    avg_order_value DECIMAL(10,2);
    last_order_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate metrics from orders
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0),
        COALESCE(AVG(total_amount), 0),
        MAX(created_at)
    INTO total_orders_count, total_spent, avg_order_value, last_order_date
    FROM orders 
    WHERE customer_id = customer_user_id;
    
    -- Update customer profile
    UPDATE customer_profiles 
    SET 
        total_orders = total_orders_count,
        customer_value = total_spent,
        average_order_value = avg_order_value,
        last_order_date = last_order_date,
        updated_at = NOW()
    WHERE user_id = customer_user_id;
END;
$$ language 'plpgsql';

-- Create trigger to update customer metrics when orders change
CREATE OR REPLACE FUNCTION trigger_update_customer_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update metrics for the customer
    PERFORM update_customer_metrics(COALESCE(NEW.customer_id, OLD.customer_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_metrics_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_update_customer_metrics();