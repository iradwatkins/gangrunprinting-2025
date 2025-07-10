-- Fix RLS policy conflicts by removing all admin policies that reference is_admin()
-- and replacing with simple role-based checks

-- Step 1: Remove ALL admin policies that might be causing conflicts
DROP POLICY IF EXISTS "Admins can manage paper stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Admins can manage coatings" ON public.coatings;
DROP POLICY IF EXISTS "Admins can manage print sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Admins can manage turnaround times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Admins can manage add ons" ON public.add_ons;
DROP POLICY IF EXISTS "Admins can manage sides" ON public.sides;
DROP POLICY IF EXISTS "Admins can manage quantities" ON public.quantities;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage vendor email log" ON public.vendor_email_log;

-- Step 2: Create simple authenticated user admin policies that check role directly
-- Paper stocks
CREATE POLICY "Authenticated admins can manage paper stocks" ON public.paper_stocks
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Coatings
CREATE POLICY "Authenticated admins can manage coatings" ON public.coatings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Print sizes
CREATE POLICY "Authenticated admins can manage print sizes" ON public.print_sizes
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Turnaround times
CREATE POLICY "Authenticated admins can manage turnaround times" ON public.turnaround_times
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Add-ons
CREATE POLICY "Authenticated admins can manage add ons" ON public.add_ons
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sides
CREATE POLICY "Authenticated admins can manage sides" ON public.sides
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Quantities
CREATE POLICY "Authenticated admins can manage quantities" ON public.quantities
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Orders
CREATE POLICY "Authenticated admins can manage all orders" ON public.orders
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Vendors  
CREATE POLICY "Authenticated admins can manage vendors" ON public.vendors
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Vendor email log
CREATE POLICY "Authenticated admins can manage vendor email log" ON public.vendor_email_log
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );