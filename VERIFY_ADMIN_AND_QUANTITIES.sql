-- STEP 1: Check if is_admin column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND column_name IN ('is_admin', 'email', 'user_id');

-- STEP 2: Check your current user and admin status
SELECT 
    up.user_id,
    up.email,
    up.is_admin,
    au.email as auth_email
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id
WHERE up.user_id = auth.uid();

-- STEP 3: If the above shows NULL for is_admin, the column doesn't exist
-- Run this to add it:
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- STEP 4: Update emails from auth.users
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id
AND up.email IS NULL;

-- STEP 5: Make yourself admin (run this with your actual user_id from step 2)
UPDATE public.user_profiles
SET is_admin = true
WHERE user_id = auth.uid();

-- STEP 6: Verify the update worked
SELECT 
    user_id,
    email,
    is_admin,
    'You should see is_admin = true' as expected
FROM public.user_profiles
WHERE user_id = auth.uid();

-- STEP 7: Check if quantities table exists and what policies it has
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'quantities';

-- STEP 8: Test direct insert (this will tell us if it's an RLS issue)
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active)
VALUES ('Direct SQL Test', '10,20,30', 20, false, false)
RETURNING *;

-- STEP 9: Clean up test
DELETE FROM public.quantities WHERE name = 'Direct SQL Test';