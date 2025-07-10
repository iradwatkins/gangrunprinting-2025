-- Set up admin user and ensure proper admin system
-- This migration ensures the admin system is properly configured

-- Step 1: Add email column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' 
                   AND column_name = 'email') THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Step 2: Update email column with data from auth.users where possible
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id
AND up.email IS NULL;

-- Step 3: Set iradwatkins@gmail.com as admin if the user exists
UPDATE public.user_profiles up
SET 
    is_admin = true,
    updated_at = now()
FROM auth.users au
WHERE up.user_id = au.id 
AND au.email = 'iradwatkins@gmail.com';

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Step 5: Create policies for admin management
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;

CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can update user profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 6: Create a view for easy admin management
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
    up.id,
    up.user_id,
    up.email,
    up.is_admin,
    up.is_broker,
    up.company_name,
    up.phone,
    up.created_at,
    up.updated_at
FROM public.user_profiles up
WHERE up.email IS NOT NULL
ORDER BY up.is_admin DESC, up.email;

-- Grant access to the view
GRANT SELECT ON public.admin_users TO authenticated;
