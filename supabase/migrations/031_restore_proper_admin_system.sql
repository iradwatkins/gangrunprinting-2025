-- CRITICAL FIX: Restore proper admin system and RLS policies
-- This migration fixes the emergency policies from 030 and restores full admin functionality

-- Step 1: Drop all the overly permissive emergency policies from migration 030
DROP POLICY IF EXISTS "Simple user profile access" ON public.user_profiles;
DROP POLICY IF EXISTS "Public read quantities" ON public.quantities;
DROP POLICY IF EXISTS "Auth write quantities" ON public.quantities;
DROP POLICY IF EXISTS "Auth update quantities" ON public.quantities;
DROP POLICY IF EXISTS "Auth delete quantities" ON public.quantities;
DROP POLICY IF EXISTS "Public read paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Public read coatings" ON public.coatings;
DROP POLICY IF EXISTS "Public read print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Public read turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Public read add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Public read sides" ON public.sides;
DROP POLICY IF EXISTS "Users own orders" ON public.orders;
DROP POLICY IF EXISTS "Auth only vendors" ON public.vendors;
DROP POLICY IF EXISTS "Auth only vendor email log" ON public.vendor_email_log;

-- Step 2: Recreate the proper admin functions that were dropped in migration 030
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.user_profiles 
        WHERE user_profiles.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is authenticated first
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has admin role in user_profiles
    RETURN (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
        OR 
        -- Fallback: iradwatkins@gmail.com is always admin
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'iradwatkins@gmail.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_broker()
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN get_user_role(auth.uid()) = 'broker';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure iradwatkins@gmail.com has admin role
UPDATE public.user_profiles 
SET role = 'admin'
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
);

-- Step 4: Create proper RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile fields" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND role = 'customer' -- New users start as customers
    );

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- Step 5: Create proper admin-only policies for all global options tables

-- Drop any existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public can view active quantities" ON public.quantities;
DROP POLICY IF EXISTS "Admins can manage quantities" ON public.quantities;
DROP POLICY IF EXISTS "Public can view active paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Admins can manage paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Public can view active coatings" ON public.coatings;
DROP POLICY IF EXISTS "Admins can manage coatings" ON public.coatings;
DROP POLICY IF EXISTS "Public can view active print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Admins can manage print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Public can view active turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Admins can manage turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Public can view active add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Admins can manage add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Public can view active sides" ON public.sides;
DROP POLICY IF EXISTS "Admins can manage sides" ON public.sides;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage vendor email log" ON public.vendor_email_log;

-- Quantities
CREATE POLICY "Public can view active quantities" ON public.quantities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage quantities" ON public.quantities
    FOR ALL USING (is_admin());

-- Paper stocks  
CREATE POLICY "Public can view active paper stocks" ON public.paper_stocks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage paper stocks" ON public.paper_stocks
    FOR ALL USING (is_admin());

-- Coatings
CREATE POLICY "Public can view active coatings" ON public.coatings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage coatings" ON public.coatings
    FOR ALL USING (is_admin());

-- Print sizes
CREATE POLICY "Public can view active print sizes" ON public.print_sizes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage print sizes" ON public.print_sizes
    FOR ALL USING (is_admin());

-- Turnaround times
CREATE POLICY "Public can view active turnaround times" ON public.turnaround_times
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage turnaround times" ON public.turnaround_times
    FOR ALL USING (is_admin());

-- Add-ons
CREATE POLICY "Public can view active add ons" ON public.add_ons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage add ons" ON public.add_ons
    FOR ALL USING (is_admin());

-- Sides
CREATE POLICY "Public can view active sides" ON public.sides
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage sides" ON public.sides
    FOR ALL USING (is_admin());

-- Categories (drop existing policies first)
DROP POLICY IF EXISTS "Public can view active categories" ON public.product_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;

CREATE POLICY "Public can view active categories" ON public.product_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.product_categories
    FOR ALL USING (is_admin());

-- Step 6: Orders policies (users can manage their own, admins can manage all)
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (is_admin());

-- Step 7: Vendor-related tables (admin only)
CREATE POLICY "Admins can manage vendors" ON public.vendors
    FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage vendor email log" ON public.vendor_email_log
    FOR ALL USING (is_admin());

-- Step 8: Grant proper permissions
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_broker() TO authenticated, anon;

-- Step 9: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_role ON public.user_profiles(user_id, role);

-- Step 10: Verify admin user exists and has correct role
DO $$ 
DECLARE
    admin_user_id UUID;
    admin_count INTEGER;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Ensure profile exists with admin role
        INSERT INTO public.user_profiles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin';
        
        -- Log success
        RAISE NOTICE 'Admin user iradwatkins@gmail.com set up successfully';
    ELSE
        RAISE NOTICE 'Warning: Admin user iradwatkins@gmail.com not found in auth.users';
    END IF;
    
    -- Check total admin count
    SELECT COUNT(*) INTO admin_count 
    FROM public.user_profiles 
    WHERE role = 'admin';
    
    RAISE NOTICE 'Total admin users: %', admin_count;
END $$;