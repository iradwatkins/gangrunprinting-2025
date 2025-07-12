-- Simplify authentication system
-- Remove broker role and add super admin functionality

-- Step 1: Create super_admin_emails table
CREATE TABLE IF NOT EXISTS public.super_admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Insert the only super admin
INSERT INTO public.super_admin_emails (email) VALUES ('iradwatkins@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Update user_profiles to remove broker-specific fields
-- First, update any existing brokers to customers
UPDATE public.user_profiles 
SET role = 'customer' 
WHERE role = 'broker';

-- Remove broker-related columns
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS is_broker,
DROP COLUMN IF EXISTS broker_status,
DROP COLUMN IF EXISTS broker_code,
DROP COLUMN IF EXISTS broker_company,
DROP COLUMN IF EXISTS broker_discount_percentage,
DROP COLUMN IF EXISTS broker_application_date,
DROP COLUMN IF EXISTS broker_approval_date,
DROP COLUMN IF EXISTS broker_notes;

-- Step 3: Update the role check constraint to only allow customer and admin
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('customer', 'admin'));

-- Step 4: Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admin_emails 
    WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function to get user role with super admin check
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
  user_role TEXT;
BEGIN
  -- Get user email and role
  SELECT email, role INTO user_email, user_role
  FROM public.user_profiles
  WHERE id = user_id;
  
  -- Check if super admin
  IF public.is_super_admin(user_email) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Return regular role
  RETURN COALESCE(user_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Update RLS policies to include super admin checks
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create new policies with super admin support
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admins can insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

CREATE POLICY "Super admins can delete profiles" ON public.user_profiles
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Step 7: Create admin management functions for super admins
CREATE OR REPLACE FUNCTION public.toggle_admin_status(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_role TEXT;
  target_user_role TEXT;
BEGIN
  -- Check if current user is super admin
  current_user_role := public.get_user_role(auth.uid());
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can toggle admin status';
  END IF;
  
  -- Get target user's current role
  SELECT role INTO target_user_role
  FROM public.user_profiles
  WHERE id = target_user_id;
  
  -- Toggle between customer and admin
  IF target_user_role = 'admin' THEN
    UPDATE public.user_profiles 
    SET role = 'customer' 
    WHERE id = target_user_id;
    RETURN FALSE;
  ELSE
    UPDATE public.user_profiles 
    SET role = 'admin' 
    WHERE id = target_user_id;
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update admin_emails table policies for super admin
DROP POLICY IF EXISTS "Only admins can view admin emails" ON public.admin_emails;
DROP POLICY IF EXISTS "Only admins can manage admin emails" ON public.admin_emails;

CREATE POLICY "Admins and super admins can view admin emails" ON public.admin_emails
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

CREATE POLICY "Only super admins can manage admin emails" ON public.admin_emails
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'super_admin'
  );

-- Step 9: Grant necessary permissions
GRANT SELECT ON public.super_admin_emails TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_admin_status TO authenticated;