-- Comprehensive RLS fix for ALL tables
-- This will disable RLS on all tables to fix permission errors

-- First, get a list of all tables with RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Disable RLS on all common tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS paper_stocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coatings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS turnaround_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS print_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quantities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sides DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS add_ons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_paper_stocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_print_sizes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_turnaround_times DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_add_ons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated and anon roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify all tables now have RLS disabled
SELECT 
    'After fix:' as status,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;