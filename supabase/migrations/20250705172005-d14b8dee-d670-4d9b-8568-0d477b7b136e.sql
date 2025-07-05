-- Ensure iradwatkins@gmail.com maintains admin privileges after any changes
UPDATE public.user_profiles 
SET 
  is_broker = true,
  broker_category_discounts = '{"admin": true}'::jsonb,
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'iradwatkins@gmail.com'
);

-- Also create user profile if it doesn't exist for the admin user
INSERT INTO public.user_profiles (
  user_id, 
  is_broker, 
  broker_category_discounts,
  company_name,
  phone,
  created_at,
  updated_at
)
SELECT 
  id, 
  true, 
  '{"admin": true}'::jsonb,
  'GangRun Printing',
  null,
  now(),
  now()
FROM auth.users 
WHERE email = 'iradwatkins@gmail.com'
AND id NOT IN (SELECT user_id FROM public.user_profiles);

-- Create customer profile for admin if needed
INSERT INTO public.customer_profiles (
  user_id, 
  customer_status,
  lifecycle_stage,
  customer_value,
  lifetime_value,
  total_orders,
  average_order_value,
  acquisition_date,
  preferred_contact_method,
  communication_preferences,
  created_at,
  updated_at
)
SELECT 
  up.user_id,
  'active',
  'customer', 
  0,
  0,
  0,
  0,
  now(),
  'email',
  '{"newsletter": true, "order_updates": true, "marketing_emails": false, "sms_notifications": false, "promotional_offers": false, "email_notifications": true}',
  now(),
  now()
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'iradwatkins@gmail.com'
AND up.user_id NOT IN (SELECT user_id FROM public.customer_profiles);