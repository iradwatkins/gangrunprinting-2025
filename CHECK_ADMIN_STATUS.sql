-- STEP 1: Check your current user and admin status
-- Run this query first to see your current status
SELECT 
    up.id,
    up.email,
    up.is_admin,
    up.created_at,
    CASE 
        WHEN up.is_admin = true THEN 'You have admin access ✓'
        ELSE 'You need admin access - run the UPDATE query below'
    END as status_message
FROM public.user_profiles up
WHERE up.id = auth.uid();

-- STEP 2: If is_admin is false, run this UPDATE to grant yourself admin access
-- Only run this if the above query shows is_admin = false
UPDATE public.user_profiles 
SET 
    is_admin = true,
    updated_at = now()
WHERE id = auth.uid()
RETURNING id, email, is_admin, 'Admin access granted!' as message;

-- STEP 3: Verify the quantities table exists and you can access it
-- This should return the count of quantity groups
SELECT 
    COUNT(*) as total_quantity_groups,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_groups,
    'Quantities table is accessible!' as status
FROM public.quantities;

-- STEP 4: Test if you can insert into quantities (with your new admin status)
-- This creates a test entry to verify insert permissions work
INSERT INTO public.quantities (name, values, default_value, has_custom, is_active)
VALUES ('Test Admin Access', '10,20,30', 20, false, false)
RETURNING id, name, 'Successfully created test quantity group - admin access working!' as message;

-- STEP 5: Clean up the test entry
DELETE FROM public.quantities 
WHERE name = 'Test Admin Access'
RETURNING 'Test entry cleaned up' as message;