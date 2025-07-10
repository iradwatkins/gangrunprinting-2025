-- Fix infinite recursion in user_profiles policies
-- The issue is that user_profiles policies are referencing themselves

-- Drop the problematic user_profiles policies that reference themselves
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;

-- Create a simple admin policy that doesn't cause recursion
-- Admin check using direct email comparison to avoid self-reference
CREATE POLICY "Admin users can manage all profiles" ON public.user_profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.user_profiles 
            WHERE is_admin = true
        )
        OR
        auth.email() LIKE '%@gangrunprinting.com'
    );

-- Alternative approach: Create a function to check admin status
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- First check if user exists and is admin via database lookup
    RETURN EXISTS (
        SELECT 1 FROM auth.users au
        WHERE au.id = auth.uid()
        AND (
            au.email LIKE '%@gangrunprinting.com'
            OR au.email = 'iradwatkins@gmail.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate admin policies using the function instead
DROP POLICY IF EXISTS "Admin users can manage all profiles" ON public.user_profiles;
CREATE POLICY "Admin users can access all profiles" ON public.user_profiles
    FOR ALL USING (is_admin_user());

-- Fix quantities policy to use the function
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (is_admin_user());

-- Fix other problematic policies
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders" ON public.orders
    FOR SELECT USING (is_admin_user());