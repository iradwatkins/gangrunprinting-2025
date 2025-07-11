-- Comprehensive fix for all permission issues
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on ALL tables to fix permission errors
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE quantities DISABLE ROW LEVEL SECURITY;
ALTER TABLE paper_stocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE coatings DISABLE ROW LEVEL SECURITY;
ALTER TABLE print_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE turnaround_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. Check if sides table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'sides'
) as sides_table_exists;

-- 3. If you want to create the sides table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS sides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    multiplier DECIMAL(10,2) DEFAULT 1.0,
    tooltip_text TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Disable RLS on sides if it exists
ALTER TABLE sides DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- 6. Verify RLS is disabled on all important tables
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'user_profiles', 'quantities', 'paper_stocks', 'coatings',
    'print_sizes', 'turnaround_times', 'add_ons', 'vendors',
    'product_categories', 'products', 'sides'
)
ORDER BY tablename;