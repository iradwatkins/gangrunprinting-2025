-- EMERGENCY FIX: Remove ALL policies that could cause infinite recursion
-- Temporarily use simple policies without user_profiles references

-- Step 1: Drop ALL policies from all tables that might reference user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;

-- Drop all admin policies that reference user_profiles
DROP POLICY IF EXISTS "Authenticated admins can manage paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Authenticated admins can manage coatings" ON public.coatings;
DROP POLICY IF EXISTS "Authenticated admins can manage print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Authenticated admins can manage turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Authenticated admins can manage add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Authenticated admins can manage sides" ON public.sides;
DROP POLICY IF EXISTS "Authenticated admins can manage quantities" ON public.quantities;
DROP POLICY IF EXISTS "Authenticated admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated admins can manage vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated admins can manage vendor email log" ON public.vendor_email_log;

-- Step 2: Create ultra-simple policies that don't reference any other tables

-- User profiles - allow authenticated users to manage their own only
CREATE POLICY "Simple user profile access" ON public.user_profiles
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- All other tables - allow read access to everyone, write to authenticated
CREATE POLICY "Public read quantities" ON public.quantities
    FOR SELECT USING (true);

CREATE POLICY "Auth write quantities" ON public.quantities
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth update quantities" ON public.quantities
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth delete quantities" ON public.quantities
    FOR DELETE TO authenticated USING (true);

-- Apply same pattern to other tables
CREATE POLICY "Public read paper stocks" ON public.paper_stocks
    FOR SELECT USING (true);

CREATE POLICY "Public read coatings" ON public.coatings
    FOR SELECT USING (true);

CREATE POLICY "Public read print sizes" ON public.print_sizes
    FOR SELECT USING (true);

CREATE POLICY "Public read turnaround times" ON public.turnaround_times
    FOR SELECT USING (true);

CREATE POLICY "Public read add ons" ON public.add_ons
    FOR SELECT USING (true);

CREATE POLICY "Public read sides" ON public.sides
    FOR SELECT USING (true);

-- Orders - users can see their own
CREATE POLICY "Users own orders" ON public.orders
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Admin-only tables - restrict to authenticated for now
CREATE POLICY "Auth only vendors" ON public.vendors
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Auth only vendor email log" ON public.vendor_email_log
    FOR ALL TO authenticated USING (true);

-- Step 3: Remove the problematic admin functions temporarily
DROP FUNCTION IF EXISTS get_user_role(UUID);
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_broker();