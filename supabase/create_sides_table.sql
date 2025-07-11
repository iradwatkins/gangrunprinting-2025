-- Create sides table if it doesn't exist
-- This matches the structure in your types.ts file

CREATE TABLE IF NOT EXISTS sides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    multiplier DECIMAL(10,2) DEFAULT 1.0 NOT NULL,
    tooltip_text TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sides_updated_at BEFORE UPDATE
    ON sides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default sides options
INSERT INTO sides (name, multiplier, tooltip_text, is_active) VALUES
    ('Single Sided (4/0)', 1.0, 'Full color front, blank back', true),
    ('Double Sided (4/4)', 1.6, 'Full color both sides', true),
    ('Front Color, Back B&W (4/1)', 1.3, 'Full color front, black & white back', true),
    ('Black & White (1/0)', 0.7, 'Black & white front only', true),
    ('Black & White Both Sides (1/1)', 1.0, 'Black & white both sides', true)
ON CONFLICT (name) DO NOTHING;

-- Disable RLS
ALTER TABLE sides DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON sides TO authenticated;
GRANT ALL ON sides TO anon;

-- Verify the table was created
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'sides'
ORDER BY ordinal_position;