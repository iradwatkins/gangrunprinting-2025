-- Fix RPC Function Conflict for Admin Access
-- This migration fixes the conflicting get_or_create_profile function definitions

-- First, drop the existing function(s)
DROP FUNCTION IF EXISTS get_or_create_profile();
DROP FUNCTION IF EXISTS get_or_create_profile(uuid);

-- Create a unified version that works without parameters (as expected by frontend)
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_data json;
  user_uuid uuid;
  user_email text;
  user_full_name text;
  user_role user_role;
BEGIN
  -- Get the current user's ID from auth context
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
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
  SELECT email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name') 
  INTO user_email, user_full_name
  FROM auth.users 
  WHERE id = user_uuid;
  
  -- Determine role based on admin_users table
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
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition where profile was created between check and insert
    SELECT row_to_json(p.*) INTO profile_data
    FROM user_profiles p
    WHERE p.user_id = user_uuid;
    RETURN profile_data;
END;
$$;

-- Also create a version with parameter for backward compatibility
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
  SELECT email, COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name') 
  INTO user_email, user_full_name
  FROM auth.users 
  WHERE id = user_uuid;
  
  -- Determine role based on admin_users table
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
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition where profile was created between check and insert
    SELECT row_to_json(p.*) INTO profile_data
    FROM user_profiles p
    WHERE p.user_id = user_uuid;
    RETURN profile_data;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_profile(uuid) TO authenticated;

-- Ensure iradwatkins@gmail.com is in admin_users table
INSERT INTO admin_users (email, notes) 
VALUES ('iradwatkins@gmail.com', 'System administrator')
ON CONFLICT (email) DO NOTHING;

-- Update any existing profile for iradwatkins@gmail.com to have admin role
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'iradwatkins@gmail.com';

-- Verify the functions work correctly
DO $$
BEGIN
  RAISE NOTICE 'Testing get_or_create_profile functions...';
  
  -- Test parameterless version (will only work if run by an authenticated user)
  -- PERFORM get_or_create_profile();
  
  -- Test with parameter version
  PERFORM get_or_create_profile((SELECT id FROM auth.users WHERE email = 'iradwatkins@gmail.com' LIMIT 1));
  
  RAISE NOTICE 'Functions created successfully';
END $$;