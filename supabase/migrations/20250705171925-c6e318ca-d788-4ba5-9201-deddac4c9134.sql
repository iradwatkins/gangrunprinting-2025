-- Fix the user profile creation trigger to handle all required fields
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function that handles profile creation properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        user_id, 
        is_broker, 
        broker_category_discounts,
        company_name,
        phone,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id, 
        false, 
        '{}',
        null,
        null,
        now(),
        now()
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create customer profile when user profile is created
CREATE OR REPLACE FUNCTION public.sync_customer_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Create customer profile when user profile is created
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
    VALUES (
        NEW.user_id,
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
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE LOG 'Failed to create customer profile for user %: %', NEW.user_id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for customer profile sync
DROP TRIGGER IF EXISTS sync_customer_profile_trigger ON public.user_profiles;
CREATE TRIGGER sync_customer_profile_trigger
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_customer_profile();