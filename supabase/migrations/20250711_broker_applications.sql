-- Create broker applications table
CREATE TABLE IF NOT EXISTS public.broker_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  annual_volume TEXT NOT NULL,
  business_address JSONB NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Add broker discount fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS has_broker_discount BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS broker_discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS broker_application_id UUID REFERENCES public.broker_applications(id),
ADD COLUMN IF NOT EXISTS broker_approved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_broker_applications_user_id ON public.broker_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_applications_status ON public.broker_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_has_broker_discount ON public.user_profiles(has_broker_discount);

-- RLS Policies for broker_applications
ALTER TABLE public.broker_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own broker applications" ON public.broker_applications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create broker applications" ON public.broker_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all broker applications" ON public.broker_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins can update applications
CREATE POLICY "Admins can update broker applications" ON public.broker_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function to approve broker application
CREATE OR REPLACE FUNCTION public.approve_broker_application(
  application_id UUID,
  discount_percentage DECIMAL(5,2) DEFAULT 10.0
)
RETURNS BOOLEAN AS $$
DECLARE
  app_user_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can approve broker applications';
  END IF;

  -- Get the user_id from the application
  SELECT user_id INTO app_user_id
  FROM public.broker_applications
  WHERE id = application_id
  AND status = 'pending';

  IF app_user_id IS NULL THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  -- Update the application
  UPDATE public.broker_applications
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = application_id;

  -- Update the user profile
  UPDATE public.user_profiles
  SET 
    has_broker_discount = TRUE,
    broker_discount_percentage = discount_percentage,
    broker_application_id = application_id,
    broker_approved_at = NOW(),
    updated_at = NOW()
  WHERE user_id = app_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject broker application
CREATE OR REPLACE FUNCTION public.reject_broker_application(
  application_id UUID,
  reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reject broker applications';
  END IF;

  -- Update the application
  UPDATE public.broker_applications
  SET 
    status = 'rejected',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    rejection_reason = reason,
    updated_at = NOW()
  WHERE id = application_id
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already processed';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.broker_applications TO authenticated;
GRANT SELECT, UPDATE ON public.broker_applications TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_broker_application TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_broker_application TO authenticated;