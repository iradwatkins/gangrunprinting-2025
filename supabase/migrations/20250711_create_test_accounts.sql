-- Create Test Accounts for Authentication System
-- This migration creates test accounts with different roles for testing

-- Note: This should only be run in development/testing environments
-- DO NOT run this in production!

-- Test Account Details:
-- 1. Admin User: admin@gangrun.test / TestAdmin123!
-- 2. Customer User: customer@gangrun.test / TestCustomer123!
-- 3. Broker User: broker@gangrun.test / TestBroker123!

-- The following accounts will be created using Supabase Auth
-- Since we can't directly insert into auth.users, we'll document the test accounts
-- and ensure the user_profiles trigger handles profile creation

-- Add test admin to admin_users table
INSERT INTO admin_users (email, notes) 
VALUES 
  ('admin@gangrun.test', 'Test admin account for development'),
  ('iradwatkins+admin@gmail.com', 'Alternative admin test account')
ON CONFLICT (email) DO NOTHING;

-- Create a helper function to set up test profiles
-- This will be called after manually creating the auth users
CREATE OR REPLACE FUNCTION setup_test_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the broker test account to have broker role and sample discounts
  UPDATE user_profiles 
  SET 
    role = 'broker',
    is_broker = true,
    broker_category_discounts = '{
      "business-cards": 10,
      "flyers": 15,
      "brochures": 12,
      "postcards": 8
    }'::jsonb,
    company = 'Test Broker Company',
    phone = '555-0123'
  WHERE email = 'broker@gangrun.test';

  -- Update customer profile with some sample data
  UPDATE user_profiles 
  SET 
    company = 'Test Customer Inc',
    phone = '555-0456'
  WHERE email = 'customer@gangrun.test';

  -- Ensure admin profile has correct role
  UPDATE user_profiles 
  SET role = 'admin'
  WHERE email IN ('admin@gangrun.test', 'iradwatkins+admin@gmail.com');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION setup_test_profiles() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION setup_test_profiles() IS 'Sets up test user profiles with appropriate roles and sample data. Run this after creating test auth accounts.';

-- Create a view to easily see all test accounts
CREATE OR REPLACE VIEW test_accounts AS
SELECT 
  u.id,
  u.email,
  p.role,
  p.is_broker,
  p.company,
  p.phone,
  p.created_at,
  CASE 
    WHEN au.email IS NOT NULL THEN true 
    ELSE false 
  END as is_admin_user_table,
  p.broker_category_discounts
FROM auth.users u
LEFT JOIN user_profiles p ON p.user_id = u.id
LEFT JOIN admin_users au ON au.email = u.email
WHERE u.email LIKE '%@gangrun.test' 
   OR u.email LIKE 'iradwatkins+%@gmail.com'
ORDER BY p.role, u.email;

-- Grant access to the view
GRANT SELECT ON test_accounts TO authenticated;

-- Instructions for creating test accounts:
COMMENT ON VIEW test_accounts IS '
Test accounts for development/testing:

1. Create accounts via Supabase Dashboard or API:
   - admin@gangrun.test / TestAdmin123!
   - customer@gangrun.test / TestCustomer123!
   - broker@gangrun.test / TestBroker123!
   - iradwatkins+admin@gmail.com / TestAdmin123!
   - iradwatkins+customer@gmail.com / TestCustomer123!

2. After creating accounts, run: SELECT setup_test_profiles();

3. View all test accounts: SELECT * FROM test_accounts;
';