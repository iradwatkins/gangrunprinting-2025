-- Add proper admin system to user_profiles table

-- Step 1: Add is_admin column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Add email column to user_profiles for easier admin management
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Step 3: Update email column with data from auth.users
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id;

-- Step 4: Set iradwatkins@gmail.com as admin
UPDATE public.user_profiles up
SET 
    is_admin = true,
    updated_at = now()
FROM auth.users au
WHERE up.user_id = au.id 
AND au.email = 'iradwatkins@gmail.com';

-- Step 5: Drop old RLS policies that use the complex admin check
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;
DROP POLICY IF EXISTS "Admin full access to paper_stocks" ON public.paper_stocks;
DROP POLICY IF EXISTS "Admin full access to coatings" ON public.coatings;
DROP POLICY IF EXISTS "Admin full access to print_sizes" ON public.print_sizes;
DROP POLICY IF EXISTS "Admin full access to turnaround_times" ON public.turnaround_times;
DROP POLICY IF EXISTS "Admin full access to add_ons" ON public.add_ons;
DROP POLICY IF EXISTS "Admin full access to quantities" ON public.quantities;
DROP POLICY IF EXISTS "Admin full access to sides" ON public.sides;

-- Step 6: Create new simplified admin policies for all tables
-- Quantities
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Paper stocks
CREATE POLICY "Admin full access to paper_stocks" ON public.paper_stocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Coatings
CREATE POLICY "Admin full access to coatings" ON public.coatings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Print sizes
CREATE POLICY "Admin full access to print_sizes" ON public.print_sizes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Turnaround times
CREATE POLICY "Admin full access to turnaround_times" ON public.turnaround_times
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Add-ons
CREATE POLICY "Admin full access to add_ons" ON public.add_ons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Sides
CREATE POLICY "Admin full access to sides" ON public.sides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 7: Add RLS policy for admins to manage user_profiles
CREATE POLICY "Admins can view all user profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

CREATE POLICY "Admins can update user profiles" ON public.user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Step 9: Create a view for easy admin management
CREATE OR REPLACE VIEW public.admin_users AS
SELECT 
    up.id,
    up.user_id,
    up.email,
    up.is_admin,
    up.is_broker,
    up.company_name,
    up.phone,
    up.created_at,
    up.updated_at
FROM public.user_profiles up
WHERE up.email IS NOT NULL
ORDER BY up.is_admin DESC, up.email;

-- Grant access to the view
GRANT SELECT ON public.admin_users TO authenticated;

-- Step 10: Verify the admin was set correctly
SELECT 
    'Admin Setup Complete' as status,
    COUNT(*) FILTER (WHERE email = 'iradwatkins@gmail.com' AND is_admin = true) as irad_is_admin,
    COUNT(*) FILTER (WHERE is_admin = true) as total_admins
FROM public.user_profiles;