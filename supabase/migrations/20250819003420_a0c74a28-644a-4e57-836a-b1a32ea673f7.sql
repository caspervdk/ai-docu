-- Fix security issues and add AI tool tracking to analyzed_files table

-- Fix function search path
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';

-- Add ai_tool_used column to existing analyzed_files table
ALTER TABLE public.analyzed_files 
ADD COLUMN IF NOT EXISTS ai_tool_used TEXT 
CHECK (ai_tool_used IN ('Summarize Long Documents', 'Cross-Doc Linker', 'Translate & Localize'));

-- Create a trigger for the analyzed_files table if it doesn't exist
DROP TRIGGER IF EXISTS update_analyzed_files_updated_at ON public.analyzed_files;
CREATE TRIGGER update_analyzed_files_updated_at
  BEFORE UPDATE ON public.analyzed_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the documents table since we're using analyzed_files instead
DROP TABLE IF EXISTS public.documents;