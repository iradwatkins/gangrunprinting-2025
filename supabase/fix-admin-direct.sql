-- DIRECT ADMIN FIX for iradwatkins@gmail.com
-- This will ensure admin access regardless of any RLS policies or issues

-- Step 1: Get your user ID and current profile status
SELECT 
    u.id as auth_user_id,
    u.email,
    p.id as profile_id,
    p.user_id as profile_user_id,
    p.role,
    p.email as profile_email,
    CASE 
        WHEN p.id IS NULL THEN 'NO PROFILE EXISTS'
        WHEN p.role = 'admin' THEN 'Already Admin'
        ELSE 'Needs Admin Role'
    END as status
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'iradwatkins@gmail.com';

-- Step 2: Update or Insert profile with admin role
-- This handles both cases: existing profile or missing profile
INSERT INTO public.user_profiles (
    user_id,
    email,
    role,
    is_broker,
    broker_category_discounts,
    created_at,
    updated_at
)
SELECT 
    id as user_id,
    email,
    'admin' as role,
    false as is_broker,
    '{}' as broker_category_discounts,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users
WHERE email = 'iradwatkins@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- Step 3: Verify the fix worked
SELECT 
    u.id as auth_user_id,
    u.email,
    p.id as profile_id,
    p.user_id,
    p.role,
    CASE 
        WHEN p.role = 'admin' THEN '✅ SUCCESS: You are now admin!'
        ELSE '❌ FAILED: Something went wrong'
    END as result
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'iradwatkins@gmail.com';

-- Step 4: Show what the app will see
SELECT 
    'Your auth user ID' as info,
    id::text as value
FROM auth.users 
WHERE email = 'iradwatkins@gmail.com'
UNION ALL
SELECT 
    'Your profile role' as info,
    role::text as value
FROM public.user_profiles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'iradwatkins@gmail.com');