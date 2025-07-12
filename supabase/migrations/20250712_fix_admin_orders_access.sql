-- Fix admin access to orders
-- This migration restores proper admin policies for the orders table

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users own orders" ON public.orders;

-- Create separate policies for users and admins
-- Users can see their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own orders
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own orders
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admins can delete orders
CREATE POLICY "Admins can delete orders" ON public.orders
    FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Also fix order_items access for admins
DROP POLICY IF EXISTS "Users can view own order jobs" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order jobs" ON public.order_items;
DROP POLICY IF EXISTS "Users can update own order jobs" ON public.order_items;

-- Users can view their own order items
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Admins can update all order items
CREATE POLICY "Admins can update all order items" ON public.order_items
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role IN ('admin', 'super_admin')
        )
    );