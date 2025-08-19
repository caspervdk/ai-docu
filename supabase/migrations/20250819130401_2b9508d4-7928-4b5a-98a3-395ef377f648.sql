-- Create user activities table for tracking real-time user actions
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user activities
CREATE POLICY "Users can view their own activities"
  ON public.user_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON public.user_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.user_activities
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON public.user_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_activities_user_id_created_at ON public.user_activities(user_id, created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_activities_updated_at
  BEFORE UPDATE ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_activities_updated_at();

-- Insert some sample activities for demonstration
INSERT INTO public.user_activities (user_id, activity_type, activity_description, activity_data, created_at)
SELECT 
  auth.uid(),
  'document_analysis',
  'Analyzed document with Translate & Localize',
  '{"tool": "translate", "document": "contract.pdf"}',
  now() - interval '2 hours'
WHERE auth.uid() IS NOT NULL
UNION ALL
SELECT 
  auth.uid(),
  'folder_creation',
  'Created new folder "Legal Documents"',
  '{"folder_name": "Legal Documents"}',
  now() - interval '1 day'
WHERE auth.uid() IS NOT NULL
UNION ALL  
SELECT 
  auth.uid(),
  'document_analysis',
  'Used Cross-Doc Linker on 3 files',
  '{"tool": "cross_doc_linker", "file_count": 3}',
  now() - interval '3 days'
WHERE auth.uid() IS NOT NULL
UNION ALL
SELECT 
  auth.uid(),
  'profile_update',
  'Profile information updated',
  '{"fields_updated": ["name", "title"]}',
  now() - interval '1 week'
WHERE auth.uid() IS NOT NULL;