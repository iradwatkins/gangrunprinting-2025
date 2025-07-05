-- Create artwork_files table that's missing from the database
CREATE TABLE IF NOT EXISTS public.artwork_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  upload_status TEXT DEFAULT 'pending',
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.artwork_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own artwork files" 
ON public.artwork_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own artwork files" 
ON public.artwork_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artwork files" 
ON public.artwork_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artwork files" 
ON public.artwork_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admin can view all artwork files" 
ON public.artwork_files 
FOR SELECT 
USING (public.is_admin_user(auth.email()));

-- Add updated_at trigger
CREATE TRIGGER artwork_files_updated_at
BEFORE UPDATE ON public.artwork_files
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();