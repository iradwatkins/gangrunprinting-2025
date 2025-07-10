-- TEMPORARY: Give all authenticated users full admin access for debugging
-- This migration removes all permission restrictions to isolate the core issue

-- Step 1: Drop ALL restrictive policies and create open ones

-- User profiles - let everyone see everything
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;

CREATE POLICY "Everyone can access user profiles" ON public.user_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categories - already open from migration 033, but ensure it
DROP POLICY IF EXISTS "anyone_can_view_active_categories" ON public.product_categories;
DROP POLICY IF EXISTS "authenticated_users_can_manage_categories" ON public.product_categories;
DROP POLICY IF EXISTS "admin_email_full_access" ON public.product_categories;

CREATE POLICY "Everyone full access to categories" ON public.product_categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Quantities
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'quantities'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.quantities', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to quantities" ON public.quantities
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Paper stocks
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'paper_stocks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.paper_stocks', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to paper_stocks" ON public.paper_stocks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Print sizes
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'print_sizes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.print_sizes', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to print_sizes" ON public.print_sizes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Turnaround times
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'turnaround_times'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.turnaround_times', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to turnaround_times" ON public.turnaround_times
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add-ons
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'add_ons'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.add_ons', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to add_ons" ON public.add_ons
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sides
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sides'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.sides', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to sides" ON public.sides
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Coatings
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'coatings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.coatings', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to coatings" ON public.coatings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders - let users see all orders for debugging
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to orders" ON public.orders
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vendors
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'vendors'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.vendors', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Everyone full access to vendors" ON public.vendors
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Step 2: Update is_admin function to always return true for authenticated users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- For debugging: all authenticated users are admin
    RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Grant all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Step 4: Make sure everyone can execute admin functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;

-- Final notice
DO $$ 
BEGIN
    RAISE NOTICE '🚨 TEMPORARY DEBUG MODE: ALL AUTHENTICATED USERS HAVE FULL ADMIN ACCESS';
    RAISE NOTICE '🚨 This should only be used for debugging - revert after finding the issue';
END $$;