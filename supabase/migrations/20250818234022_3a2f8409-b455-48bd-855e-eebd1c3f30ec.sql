-- Create table for tracking analyzed files
CREATE TABLE public.analyzed_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  analysis_type TEXT NOT NULL, -- e.g., 'document_analysis', 'image_analysis', etc.
  analysis_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analyzed_files ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own analyzed files" 
ON public.analyzed_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyzed files" 
ON public.analyzed_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyzed files" 
ON public.analyzed_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyzed files" 
ON public.analyzed_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_analyzed_files_updated_at
BEFORE UPDATE ON public.analyzed_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_analyzed_files_user_id_created_at ON public.analyzed_files(user_id, created_at DESC);