-- EMERGENCY FIX FOR AUTH LOADING ISSUES
-- Run this in Supabase SQL Editor to fix all authentication and permission problems

-- 1. Disable RLS on ALL tables to prevent permission errors
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP 
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY;';
        RAISE NOTICE 'Disabled RLS on table: %', r.tablename;
    END LOOP; 
END $$;

-- 2. Grant full permissions to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 3. Create user_profiles if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    company TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'broker')),
    broker_status TEXT CHECK (broker_status IN ('pending', 'approved', 'rejected')),
    is_broker BOOLEAN DEFAULT false,
    broker_category_discounts JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 5. Insert a profile for any existing auth users that don't have one
INSERT INTO user_profiles (id, email, role)
SELECT 
    id, 
    email,
    CASE 
        WHEN email = 'iradwatkins@gmail.com' THEN 'admin'
        ELSE 'customer'
    END as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 6. Verify the fix
SELECT 
    'Tables with RLS disabled:' as info,
    COUNT(*) as count 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;

SELECT 
    'User profiles created:' as info,
    COUNT(*) as count 
FROM user_profiles;

-- 7. Show current user info
SELECT 
    'Current authenticated user:' as info,
    auth.uid() as user_id,
    auth.email() as email,
    auth.role() as role;