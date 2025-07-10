-- Fix admin SELECT access for vendors table
-- This ensures admins can read vendors for the products page dropdowns

-- Add admin SELECT policy for vendors (to match categories pattern)
CREATE POLICY "Admin can view all vendors" ON public.vendors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (broker_category_discounts::jsonb ? 'admin' OR user_id IN (
                SELECT id FROM auth.users WHERE email LIKE '%@gangrunprinting.com'
            ))
        )
    );