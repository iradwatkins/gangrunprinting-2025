-- ENSURE ADMIN ACCESS FOR iradwatkins@gmail.com
-- This migration ensures proper admin access in production

-- Step 1: Check current database structure
DO $$ 
DECLARE
    has_role_column BOOLEAN;
    has_is_admin_column BOOLEAN;
    admin_user_id UUID;
BEGIN
    -- Check which columns exist in user_profiles
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) INTO has_role_column;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_admin'
    ) INTO has_is_admin_column;
    
    RAISE NOTICE 'Database structure - has role column: %, has is_admin column: %', 
        has_role_column, has_is_admin_column;
    
    -- Get the user ID for iradwatkins@gmail.com
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
    LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE WARNING 'User iradwatkins@gmail.com not found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user iradwatkins@gmail.com with ID: %', admin_user_id;
    
    -- Ensure user profile exists
    INSERT INTO public.user_profiles (user_id, created_at, updated_at)
    VALUES (admin_user_id, now(), now())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Update based on which columns exist
    IF has_role_column THEN
        -- Update role to admin
        UPDATE public.user_profiles 
        SET role = 'admin', updated_at = now()
        WHERE user_id = admin_user_id;
        RAISE NOTICE 'Set role = admin for iradwatkins@gmail.com';
    END IF;
    
    IF has_is_admin_column THEN
        -- Update is_admin to true
        UPDATE public.user_profiles 
        SET is_admin = true, updated_at = now()
        WHERE user_id = admin_user_id;
        RAISE NOTICE 'Set is_admin = true for iradwatkins@gmail.com';
    END IF;
    
    -- If neither column exists, add is_admin column
    IF NOT has_role_column AND NOT has_is_admin_column THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
        
        UPDATE public.user_profiles 
        SET is_admin = true, updated_at = now()
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'Added is_admin column and set to true for iradwatkins@gmail.com';
    END IF;
END $$;

-- Step 2: Create or replace a simple is_admin function that works with any structure
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_email TEXT;
    has_admin_role BOOLEAN := false;
    is_admin_flag BOOLEAN := false;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Get user email
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Primary check: email-based (most reliable)
    IF user_email = 'iradwatkins@gmail.com' THEN
        RETURN TRUE;
    END IF;
    
    -- Check role column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        SELECT (role = 'admin') INTO has_admin_role
        FROM public.user_profiles 
        WHERE user_id = current_user_id;
        
        IF has_admin_role THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    -- Check is_admin column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_admin'
    ) THEN
        SELECT is_admin INTO is_admin_flag
        FROM public.user_profiles 
        WHERE user_id = current_user_id;
        
        IF is_admin_flag THEN
            RETURN TRUE;
        END IF;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- Step 4: Create policies for user management (if they don't exist)
DO $$ 
BEGIN
    -- Check if policies exist before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles'
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = user_id OR is_admin());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'auth' 
        AND tablename = 'users'
        AND policyname = 'Admins can view all users'
    ) THEN
        CREATE POLICY "Admins can view all users" ON auth.users
            FOR SELECT USING (is_admin());
    END IF;
END $$;

-- Step 5: Verify admin access
DO $$ 
DECLARE
    test_result BOOLEAN;
    user_count INTEGER;
BEGIN
    -- Test is_admin function
    SELECT is_admin() INTO test_result;
    RAISE NOTICE 'is_admin() test result: %', test_result;
    
    -- Count total admins
    SELECT COUNT(*) INTO user_count
    FROM public.user_profiles p
    JOIN auth.users u ON p.user_id = u.id
    WHERE (
        u.email = 'iradwatkins@gmail.com' 
        OR (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') AND p.role = 'admin')
    );
    
    RAISE NOTICE 'Total admin users found: %', user_count;
    
    IF user_count > 0 THEN
        RAISE NOTICE '✅ Admin setup successful!';
    ELSE
        RAISE WARNING '⚠️ No admin users found!';
    END IF;
END $$;