-- Add missing fields to artwork_files table
ALTER TABLE public.artwork_files 
ADD COLUMN IF NOT EXISTS file_type TEXT DEFAULT 'image',
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending';

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_status_history
CREATE POLICY "Users can view their own order status history" 
ON public.order_status_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_status_history.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Admin can view all order status history" 
ON public.order_status_history 
FOR SELECT 
USING (public.is_admin_user(auth.email()));

CREATE POLICY "System can insert order status history" 
ON public.order_status_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can update order status history" 
ON public.order_status_history 
FOR UPDATE 
USING (public.is_admin_user(auth.email()));