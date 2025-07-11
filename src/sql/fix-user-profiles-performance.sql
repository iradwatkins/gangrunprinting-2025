-- Check and optimize user_profiles table performance

-- 1. Ensure proper index on id column (primary key should have index by default)
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- 2. Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 3. Drop any complex policies and recreate simple ones
-- First, disable RLS temporarily to drop all policies
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, efficient RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role has full access" 
ON public.user_profiles FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- Allow inserts for new profiles
CREATE POLICY "Enable insert for authenticated users only" 
ON public.user_profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 5. Create a simple function to get user profile (can be faster than direct query with RLS)
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS public.user_profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT * FROM public.user_profiles WHERE id = user_id LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;

-- 6. Analyze the table to update statistics
ANALYZE public.user_profiles;

-- 7. Check table size and row count
SELECT 
    pg_size_pretty(pg_relation_size('public.user_profiles')) as table_size,
    (SELECT COUNT(*) FROM public.user_profiles) as row_count;