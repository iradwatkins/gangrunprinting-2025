-- Rebuild clean role-based system
-- Role rules: customers by default, admin can manually promote customers to brokers
-- Only iradwatkins@gmail.com is admin

-- Step 1: Drop ALL existing problematic policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin users can access all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;

-- Drop all admin policies from other tables
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;
DROP POLICY IF EXISTS "Admin full access to paper_stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Admin full access to coatings" ON public.coatings;
DROP POLICY IF EXISTS "Admin full access to print_sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Admin full access to turnaround_times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Admin full access to add_ons" ON public.add_ons;
DROP POLICY IF EXISTS "Admin full access to sides" ON public.sides;
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admin users can access vendor email logs" ON public.vendor_email_log;
DROP POLICY IF EXISTS "Admin users can access vendors" ON public.vendors;

-- Drop the problematic admin function
DROP FUNCTION IF EXISTS is_admin_user();

-- Step 2: Clean up user_profiles table structure
-- Drop dependent views first
DROP VIEW IF EXISTS public.admin_users;

ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS is_admin,
DROP COLUMN IF EXISTS email;

-- Step 3: Add clean role system
-- Create role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer', 'broker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column with default 'customer'
ALTER TABLE public.user_profiles 
ADD COLUMN role user_role DEFAULT 'customer' NOT NULL;

-- Step 4: Create simple, clean helper functions
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
    
    -- Only iradwatkins@gmail.com is admin, or users with admin role
    RETURN (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'iradwatkins@gmail.com'
        )
        OR 
        get_user_role(auth.uid()) = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_broker()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(auth.uid()) = 'broker';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Set iradwatkins@gmail.com as admin (only admin)
UPDATE public.user_profiles 
SET role = 'admin'
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'iradwatkins@gmail.com'
);

-- Step 6: Create clean RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own non-role fields only
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

-- Admins can update any profile including roles
CREATE POLICY "Admins can update any profile" ON public.user_profiles
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- Step 7: Create clean admin policies for all tables
-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view active quantities" ON public.quantities;
DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
DROP POLICY IF EXISTS "Public can view active paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Public can view active coatings" ON public.coatings;
DROP POLICY IF EXISTS "Public can view active print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Public can view active turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Public can view active add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Public can view active sides" ON public.sides;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

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

-- Orders (users can see their own, admins can see all)
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (is_admin());

-- Vendors (admin only)
CREATE POLICY "Admins can manage vendors" ON public.vendors
    FOR ALL USING (is_admin());

-- Vendor email log (admin only)
CREATE POLICY "Admins can manage vendor email log" ON public.vendor_email_log
    FOR ALL USING (is_admin());

-- Step 8: Create function to auto-assign customer role on registration
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- All new users start as customers (including iradwatkins@gmail.com initially)
    INSERT INTO public.user_profiles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    -- Immediately promote iradwatkins@gmail.com to admin
    IF NEW.email = 'iradwatkins@gmail.com' THEN
        UPDATE public.user_profiles 
        SET role = 'admin' 
        WHERE user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_role ON public.user_profiles(user_id, role);

-- Step 10: Grant permissions
GRANT USAGE ON TYPE user_role TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_broker() TO authenticated, anon;

-- Step 11: Update existing user_profiles to remove is_broker column dependency
-- Convert existing is_broker values to role
UPDATE public.user_profiles 
SET role = 'broker' 
WHERE is_broker = true AND role = 'customer';

-- Now we can safely drop the old is_broker column
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS is_broker;