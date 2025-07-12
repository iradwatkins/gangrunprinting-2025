-- Clean Authentication System Setup
-- This migration creates a production-ready authentication system

-- Step 1: Ensure user_profiles table has correct structure
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  company text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'broker')),
  broker_status text CHECK (broker_status IN ('pending', 'approved', 'rejected')),
  is_broker boolean DEFAULT false,
  broker_category_discounts jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Step 2: Create admin management table
CREATE TABLE IF NOT EXISTS admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  notes text
);

-- Insert initial admin
INSERT INTO admin_emails (email, notes) 
VALUES ('iradwatkins@gmail.com', 'Primary administrator')
ON CONFLICT (email) DO NOTHING;

-- Step 3: Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_emails WHERE email = user_email
  );
END;
$$;

-- Step 4: Create function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile user_profiles;
BEGIN
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO user_profiles (
      user_id,
      email,
      full_name,
      role
    )
    SELECT 
      id,
      email,
      COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'),
      CASE 
        WHEN is_admin(email) THEN 'admin'
        ELSE 'customer'
      END
    FROM auth.users
    WHERE id = auth.uid()
    RETURNING * INTO v_profile;
  END IF;
  
  RETURN v_profile;
END;
$$;

-- Step 5: Create trigger to auto-create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (
    user_id,
    email,
    full_name,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE 
      WHEN is_admin(NEW.email) THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
END;
$$;

-- Ensure trigger is set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Step 6: Set up RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON user_profiles;

-- User profile policies
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
  ON user_profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" 
  ON user_profiles FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role bypass" 
  ON user_profiles FOR ALL 
  USING (auth.role() = 'service_role');

-- Admin emails policies
CREATE POLICY "Only admins can view admin emails" 
  ON admin_emails FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage admin emails" 
  ON admin_emails FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON admin_emails TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(text) TO authenticated;

-- Step 8: Update existing profiles
UPDATE user_profiles 
SET role = 'admin' 
WHERE email IN (SELECT email FROM admin_emails);

-- Step 9: Create helper view for admins
CREATE OR REPLACE VIEW user_management AS
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.full_name,
  p.phone,
  p.company,
  p.role,
  p.is_broker,
  p.created_at as profile_created,
  p.updated_at as profile_updated,
  ae.email IS NOT NULL as is_admin_email
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN admin_emails ae ON u.email = ae.email
ORDER BY u.created_at DESC;

GRANT SELECT ON user_management TO authenticated;