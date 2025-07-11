-- Fix infinite recursion in user_profiles RLS policies

-- First, drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with fixed policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view all profiles" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- For quantities table, also fix any RLS issues
ALTER TABLE quantities DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled on quantities
-- ALTER TABLE quantities ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable read access for all users" ON quantities FOR SELECT USING (true);
-- CREATE POLICY "Enable all access for authenticated users" ON quantities FOR ALL USING (auth.role() = 'authenticated');

-- Verify the changes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'quantities')
ORDER BY tablename, policyname;