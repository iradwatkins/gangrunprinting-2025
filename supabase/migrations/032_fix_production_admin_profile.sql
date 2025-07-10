-- CRITICAL FIX: Ensure admin profile exists in production
-- This migration fixes missing admin profile issues that prevent category saving

-- Step 1: Create a robust function to ensure admin profile exists
CREATE OR REPLACE FUNCTION ensure_admin_profile()
RETURNS void AS $$
DECLARE
    admin_user_id UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Get the admin user ID from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Check if profile already exists
        SELECT EXISTS(
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = admin_user_id
        ) INTO profile_exists;
        
        IF profile_exists THEN
            -- Update existing profile to ensure admin role
            UPDATE public.user_profiles 
            SET role = 'admin',
                updated_at = now()
            WHERE user_id = admin_user_id;
            
            RAISE NOTICE 'Updated existing profile for iradwatkins@gmail.com to admin role';
        ELSE
            -- Create new profile with admin role
            INSERT INTO public.user_profiles (user_id, role, created_at, updated_at)
            VALUES (admin_user_id, 'admin', now(), now());
            
            RAISE NOTICE 'Created new admin profile for iradwatkins@gmail.com';
        END IF;
    ELSE
        RAISE NOTICE 'Warning: iradwatkins@gmail.com not found in auth.users';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Execute the function to ensure admin profile exists
SELECT ensure_admin_profile();

-- Step 3: Enhance the is_admin() function to be more robust
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    user_role user_role;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated first
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user email for fallback check
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Primary admin check: email-based (most reliable)
    IF user_email = 'iradwatkins@gmail.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Secondary admin check: role-based
    SELECT role INTO user_role
    FROM public.user_profiles 
    WHERE user_id = current_user_id;
    
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Not admin
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a function to debug admin status (for production troubleshooting)
CREATE OR REPLACE FUNCTION debug_admin_status()
RETURNS json AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    user_role user_role;
    profile_exists BOOLEAN;
    result json;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'authenticated', false,
            'message', 'No authenticated user'
        );
    END IF;
    
    -- Get user details
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Check if profile exists
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = current_user_id
    ) INTO profile_exists;
    
    -- Get role if profile exists
    IF profile_exists THEN
        SELECT role INTO user_role
        FROM public.user_profiles 
        WHERE user_id = current_user_id;
    END IF;
    
    -- Build debug result
    result := json_build_object(
        'authenticated', true,
        'user_id', current_user_id,
        'email', user_email,
        'profile_exists', profile_exists,
        'role', user_role,
        'is_target_email', (user_email = 'iradwatkins@gmail.com'),
        'is_admin_result', is_admin()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION ensure_admin_profile() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION debug_admin_status() TO authenticated, anon;

-- Step 6: Verify admin setup
DO $$ 
DECLARE
    admin_count INTEGER;
    debug_info json;
BEGIN
    -- Count admin users
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_profiles 
    WHERE role = 'admin';
    
    RAISE NOTICE 'Total admin users after migration: %', admin_count;
    
    -- If we have at least one admin, show success
    IF admin_count > 0 THEN
        RAISE NOTICE 'Admin setup successful!';
    ELSE
        RAISE WARNING 'No admin users found after migration!';
    END IF;
END $$;