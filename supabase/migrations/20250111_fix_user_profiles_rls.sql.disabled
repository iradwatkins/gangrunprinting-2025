-- Fix user_profiles RLS and ensure proper setup

-- 1. First, ensure the user_profiles table has the correct structure
ALTER TABLE IF EXISTS public.user_profiles 
  ALTER COLUMN id SET DEFAULT auth.uid();

-- 2. Temporarily disable RLS to clean up
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies
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

-- 4. Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create simple, performant RLS policies

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role bypass" 
ON public.user_profiles FOR ALL 
USING (
  auth.jwt()->>'role' = 'service_role' OR
  auth.jwt()->>'supabase_admin' = 'true'
);

-- 6. Create or replace a function to safely get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_profile()
RETURNS public.user_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_record public.user_profiles;
BEGIN
  -- Try to get existing profile
  SELECT * INTO profile_record
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  -- If not found, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_profiles (
      user_id,
      email,
      role,
      is_broker,
      broker_category_discounts,
      created_at,
      updated_at
    )
    VALUES (
      auth.uid(),
      auth.jwt()->>'email',
      CASE 
        WHEN auth.jwt()->>'email' = 'iradwatkins@gmail.com' THEN 'admin'
        ELSE 'customer'
      END,
      false,
      '{}',
      NOW(),
      NOW()
    )
    RETURNING * INTO profile_record;
  END IF;
  
  RETURN profile_record;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_profile() TO authenticated;

-- 7. Create an index on id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);

-- 8. Create a trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    role,
    is_broker,
    broker_category_discounts
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'iradwatkins@gmail.com' THEN 'admin'
      ELSE 'customer'
    END,
    false,
    '{}'
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Ensure all existing auth users have profiles
INSERT INTO public.user_profiles (user_id, email, role, is_broker, broker_category_discounts)
SELECT 
  id,
  email,
  CASE 
    WHEN email = 'iradwatkins@gmail.com' THEN 'admin'
    ELSE 'customer'
  END,
  false,
  '{}'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 10. Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- 11. Analyze the table for better query performance
ANALYZE public.user_profiles;