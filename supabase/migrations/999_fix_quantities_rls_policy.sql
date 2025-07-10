-- Fix RLS policy for quantities table to use is_admin field

-- Drop the old policy
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

-- Create new policy using is_admin field
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Also ensure public read access policy exists
DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);