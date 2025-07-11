-- Fix Authentication System
-- This migration fixes the user_profiles schema and implements production-ready RLS policies

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable all for authenticated users temporarily" ON user_profiles;
DROP POLICY IF EXISTS "temp_auth_admin_access" ON user_profiles;
DROP POLICY IF EXISTS "temp_debug_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON user_profiles;

-- Fix the user_profiles table schema
-- Remove the incorrect default for id column
ALTER TABLE user_profiles ALTER COLUMN id DROP DEFAULT;

-- Ensure proper column definitions
ALTER TABLE user_profiles 
  ALTER COLUMN email TYPE text,
  ALTER COLUMN full_name TYPE text,
  ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create admin_users table for flexible admin management
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  notes text
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Insert initial admin
INSERT INTO admin_users (email, notes) 
VALUES ('iradwatkins@gmail.com', 'System administrator')
ON CONFLICT (email) DO NOTHING;

-- Create a proper is_admin function that checks admin_users table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user's email is in admin_users table
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = auth.jwt()->>'email'
  );
END;
$$;

-- Create production-ready RLS policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" 
  ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from changing their own role
    (OLD.role = NEW.role OR is_admin())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON user_profiles 
  FOR SELECT 
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
  ON user_profiles 
  FOR UPDATE 
  USING (is_admin());

-- Admins can insert profiles (for user management)
CREATE POLICY "Admins can insert profiles" 
  ON user_profiles 
  FOR INSERT 
  WITH CHECK (is_admin());

-- Service role can do anything (for triggers and system operations)
CREATE POLICY "Service role full access" 
  ON user_profiles 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- RLS policies for admin_users table
-- Only admins can view admin_users
CREATE POLICY "Only admins can view admin_users" 
  ON admin_users 
  FOR SELECT 
  USING (is_admin());

-- Only admins can manage admin_users
CREATE POLICY "Only admins can manage admin_users" 
  ON admin_users 
  FOR ALL 
  USING (is_admin());

-- Update the profile creation trigger to use admin_users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_role user_role;
BEGIN
  -- Get the user's email
  user_email := NEW.email;
  
  -- Check if user should be admin
  IF EXISTS (SELECT 1 FROM admin_users WHERE email = user_email) THEN
    user_role := 'admin';
  ELSE
    user_role := 'customer';
  END IF;
  
  -- Create user profile
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    role,
    is_broker,
    broker_category_discounts
  ) VALUES (
    NEW.id,
    user_email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    user_role,
    false,
    '{}'::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to safely get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_profile(user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  user_email text;
  user_full_name text;
  user_role user_role;
BEGIN
  -- Try to get existing profile
  SELECT row_to_json(p.*) INTO profile_data
  FROM user_profiles p
  WHERE p.user_id = user_uuid;
  
  -- If profile exists, return it
  IF profile_data IS NOT NULL THEN
    RETURN profile_data;
  END IF;
  
  -- Profile doesn't exist, create it
  -- Get user info from auth.users
  SELECT email, raw_user_meta_data->>'full_name' 
  INTO user_email, user_full_name
  FROM auth.users 
  WHERE id = user_uuid;
  
  -- Determine role
  IF EXISTS (SELECT 1 FROM admin_users WHERE email = user_email) THEN
    user_role := 'admin';
  ELSE
    user_role := 'customer';
  END IF;
  
  -- Create profile
  INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    role,
    is_broker,
    broker_category_discounts
  ) VALUES (
    user_uuid,
    user_email,
    user_full_name,
    user_role,
    false,
    '{}'::jsonb
  ) RETURNING row_to_json(user_profiles.*) INTO profile_data;
  
  RETURN profile_data;
END;
$$;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_profile(uuid) TO authenticated;

-- Fix any existing profiles that might have wrong role
UPDATE user_profiles 
SET role = 'admin' 
WHERE email IN (SELECT email FROM admin_users);

-- Add comment explaining the system
COMMENT ON TABLE admin_users IS 'Table to manage admin users. Add email addresses here to grant admin access.';
COMMENT ON COLUMN admin_users.email IS 'Email address of the admin user. Must match their auth.users email.';
COMMENT ON COLUMN admin_users.notes IS 'Optional notes about why this user has admin access.';