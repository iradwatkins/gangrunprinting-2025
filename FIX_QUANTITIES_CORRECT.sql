-- FIRST: Check your current user profile structure
SELECT 
    id,
    user_id,
    is_broker,
    broker_category_discounts,
    company_name,
    phone
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- SECOND: Check if you're considered an admin (using the existing system)
SELECT 
    id,
    user_id,
    CASE 
        WHEN broker_category_discounts::jsonb ? 'admin' THEN 'You have admin access via broker_category_discounts'
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = user_profiles.user_id 
            AND email LIKE '%@gangrunprinting.com'
        ) THEN 'You have admin access via email domain'
        ELSE 'You do not have admin access'
    END as admin_status
FROM public.user_profiles 
WHERE user_id = auth.uid();

-- THIRD: Grant yourself admin access by updating broker_category_discounts
UPDATE public.user_profiles 
SET 
    broker_category_discounts = COALESCE(broker_category_discounts::jsonb, '{}'::jsonb) || '{"admin": true}'::jsonb,
    updated_at = now()
WHERE user_id = auth.uid()
RETURNING id, user_id, broker_category_discounts;

-- FOURTH: Fix the quantities table RLS policy to use the correct admin check
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (
                broker_category_discounts::jsonb ? 'admin' 
                OR EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE id = auth.uid() 
                    AND email LIKE '%@gangrunprinting.com'
                )
            )
        )
    );

-- FIFTH: Verify the quantities table is set up correctly
SELECT 
    COUNT(*) as total_quantity_groups,
    'Quantities table exists and is accessible!' as status
FROM public.quantities;