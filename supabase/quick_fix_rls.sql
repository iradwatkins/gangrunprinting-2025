-- Quick fix for RLS issues
-- Run this in Supabase SQL Editor to fix the infinite recursion error

-- Disable RLS on problematic tables
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE quantities DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'quantities')
ORDER BY tablename;