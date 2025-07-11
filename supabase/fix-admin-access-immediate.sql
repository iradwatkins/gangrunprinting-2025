-- IMMEDIATE FIX: Set iradwatkins@gmail.com as admin
-- Run this in Supabase SQL editor to immediately fix admin access

-- Step 1: Find the user ID for iradwatkins@gmail.com
DO $$ 
DECLARE
    admin_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Get the user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User iradwatkins@gmail.com not found in auth.users';
    END IF;
    
    RAISE NOTICE 'Found user iradwatkins@gmail.com with ID: %', admin_user_id;
    
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles WHERE user_id = admin_user_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        -- Update existing profile
        UPDATE public.user_profiles 
        SET 
            role = 'admin',
            updated_at = NOW()
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'Updated existing profile to admin role';
    ELSE
        -- Create new profile with admin role
        INSERT INTO public.user_profiles (
            user_id,
            email,
            role,
            is_broker,
            broker_category_discounts,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'iradwatkins@gmail.com',
            'admin',
            false,
            '{}',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created new profile with admin role';
    END IF;
END $$;

-- Step 2: Verify the update
SELECT 
    u.email,
    p.id,
    p.user_id,
    p.role,
    p.updated_at
FROM auth.users u
JOIN public.user_profiles p ON u.id = p.user_id
WHERE u.email = 'iradwatkins@gmail.com';

-- Step 3: Test that admin detection will work
SELECT 
    CASE 
        WHEN role = 'admin' THEN '✅ Admin role is set correctly'
        ELSE '❌ Admin role NOT set - something went wrong'
    END as status
FROM public.user_profiles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'iradwatkins@gmail.com');