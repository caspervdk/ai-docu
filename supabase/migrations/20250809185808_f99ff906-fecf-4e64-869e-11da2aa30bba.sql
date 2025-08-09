-- Create a private bucket for user documents (id = 'documents')
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Policies: users can manage only their own files inside a folder named with their user id
-- Helper: (storage.foldername(name))[1] extracts the first path segment (user id)

-- SELECT policy
DO $$ BEGIN
  CREATE POLICY "Users can view their own documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- INSERT policy
DO $$ BEGIN
  CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- UPDATE policy
DO $$ BEGIN
  CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- DELETE policy
DO $$ BEGIN
  CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;