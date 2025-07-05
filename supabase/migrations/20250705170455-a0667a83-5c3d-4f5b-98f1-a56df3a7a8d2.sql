
-- Ensure the user profile exists for iradwatkins@gmail.com and has admin privileges
INSERT INTO user_profiles (user_id, is_broker, broker_category_discounts)
SELECT id, true, '{"admin": true}'::jsonb
FROM auth.users 
WHERE email = 'iradwatkins@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_broker = true,
  broker_category_discounts = '{"admin": true}'::jsonb,
  updated_at = now();

-- Update the admin check function to be more reliable
CREATE OR REPLACE FUNCTION public.is_admin_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN user_profiles up ON u.id = up.user_id
    WHERE u.email = user_email 
    AND (
      up.broker_category_discounts ? 'admin' 
      OR u.email LIKE '%@gangrunprinting.com'
    )
  );
$$;

-- Update RLS policies to use the new function for admin checks
CREATE POLICY "Admin users have full access" ON user_profiles
FOR ALL USING (
  auth.uid() = user_id 
  OR public.is_admin_user(auth.email())
);
