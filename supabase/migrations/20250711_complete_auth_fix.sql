-- Complete Authentication System Fix
-- This migration ensures the authentication system works correctly

-- Step 1: Ensure admin_users table exists with correct structure
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  notes text
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Step 2: Ensure user_profiles has correct structure
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'full_name') THEN
    ALTER TABLE user_profiles ADD COLUMN full_name text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
    ALTER TABLE user_profiles ADD COLUMN role user_role DEFAULT 'customer';
  END IF;
END $$;

-- Step 3: Drop ALL existing get_or_create_profile functions
DROP FUNCTION IF EXISTS get_or_create_profile();
DROP FUNCTION IF EXISTS get_or_create_profile(uuid);

-- Step 4: Create the CORRECT get_or_create_profile function
-- This version works WITHOUT parameters (as expected by frontend)
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_full_name text;
  v_profile user_profiles;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Try to get existing profile
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = v_user_id;
  
  -- If profile exists, return it
  IF FOUND THEN
    RETURN v_profile;
  END IF;
  
  -- Profile doesn't exist, create it
  -- Get user info from auth.users
  SELECT 
    email,
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
  INTO v_email, v_full_name
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Insert new profile
  INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    role,
    is_broker,
    broker_category_discounts,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_email,
    v_full_name,
    CASE 
      WHEN EXISTS (SELECT 1 FROM admin_users WHERE email = v_email) THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END,
    false,
    '{}'::jsonb,
    now(),
    now()
  )
  RETURNING * INTO v_profile;
  
  RETURN v_profile;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition
    SELECT * INTO v_profile
    FROM user_profiles
    WHERE user_id = v_user_id;
    RETURN v_profile;
END;
$$;

-- Step 5: Create is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = auth.jwt()->>'email'
  );
END;
$$;

-- Step 6: Set up proper RLS policies
-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users temporarily" ON user_profiles;
DROP POLICY IF EXISTS "temp_auth_admin_access" ON user_profiles;
DROP POLICY IF EXISTS "temp_debug_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role full access" ON user_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON user_profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (OLD.role = NEW.role OR is_admin()));

CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admins can update all profiles" 
  ON user_profiles FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can insert profiles" 
  ON user_profiles FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Service role bypass" 
  ON user_profiles FOR ALL 
  USING (auth.role() = 'service_role');

-- Policies for admin_users
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin_users" ON admin_users;

CREATE POLICY "Only admins can view admin_users" 
  ON admin_users FOR SELECT 
  USING (is_admin());

CREATE POLICY "Only admins can manage admin_users" 
  ON admin_users FOR ALL 
  USING (is_admin());

-- Step 7: Ensure iradwatkins@gmail.com is admin
INSERT INTO admin_users (email, notes) 
VALUES ('iradwatkins@gmail.com', 'Primary system administrator')
ON CONFLICT (email) DO NOTHING;

-- Step 8: Update existing profile if it exists
UPDATE user_profiles 
SET role = 'admin'
WHERE email = 'iradwatkins@gmail.com';

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON admin_users TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Step 10: Create helpful diagnostic view
CREATE OR REPLACE VIEW auth_diagnostics AS
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.role,
  p.created_at as profile_created,
  CASE WHEN au.email IS NOT NULL THEN true ELSE false END as in_admin_table,
  au.notes as admin_notes
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN admin_users au ON u.email = au.email
ORDER BY u.created_at DESC;

-- Grant access to the diagnostic view
GRANT SELECT ON auth_diagnostics TO authenticated;

-- Final verification
DO $$
DECLARE
  admin_count integer;
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM admin_users;
  SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE role = 'admin';
  
  RAISE NOTICE 'Setup complete. Admin users: %, Admin profiles: %', admin_count, profile_count;
END $$;