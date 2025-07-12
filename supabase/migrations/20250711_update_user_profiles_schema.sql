-- Update user_profiles table to match new simplified auth system
-- This migration ensures the user_profiles table has the proper columns

-- Add missing columns if they don't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Update role column constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.user_profiles 
    DROP CONSTRAINT IF EXISTS user_profiles_role_check;
    
    ALTER TABLE public.user_profiles 
    ADD CONSTRAINT user_profiles_role_check 
    CHECK (role IN ('customer', 'admin'));
  END IF;
END $$;

-- Populate email from auth.users if missing
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id
AND up.email IS NULL;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Update RLS policies to ensure users can update their own profiles
DROP POLICY IF EXISTS "Users can update own profile including name" ON public.user_profiles;

CREATE POLICY "Users can update own profile including name" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );