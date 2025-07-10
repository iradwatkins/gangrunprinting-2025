-- Fix infinite recursion in user_profiles RLS policy
-- The issue is in the quantities policy referencing user_profiles incorrectly

-- Drop the problematic policy from quantities
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

-- Create correct policy using user_id instead of id
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Also add admin policies for other tables that might have similar issues
-- Drop and recreate other potentially problematic policies

-- Fix orders policies
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Fix user_profiles admin policy
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
CREATE POLICY "Admin can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.user_id = auth.uid() 
            AND up.is_admin = true
        )
    );