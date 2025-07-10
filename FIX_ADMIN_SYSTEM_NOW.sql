-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR TO FIX THE ADMIN SYSTEM

-- Step 1: Add is_admin column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Add email column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 3: Update email column with data from auth.users
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id;

-- Step 4: Make iradwatkins@gmail.com an admin
UPDATE public.user_profiles up
SET 
    is_admin = true,
    updated_at = now()
FROM auth.users au
WHERE up.user_id = au.id 
AND au.email = 'iradwatkins@gmail.com';

-- Step 5: Fix the quantities RLS policy
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 6: Allow admins to manage other users
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;

CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
    FOR SELECT USING (
        user_id = auth.uid() OR
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

-- Step 7: Verify everything worked
SELECT 
    email,
    is_admin,
    CASE 
        WHEN email = 'iradwatkins@gmail.com' AND is_admin = true THEN '✓ iradwatkins@gmail.com is now an admin!'
        WHEN is_admin = true THEN '✓ Admin user'
        ELSE 'Regular user'
    END as status
FROM public.user_profiles
WHERE email IS NOT NULL
ORDER BY is_admin DESC, email;