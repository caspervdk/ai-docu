-- Create public_uploads bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('public_uploads', 'public_uploads', true)
on conflict (id) do nothing;

-- Public read access (anyone can read/list)
create policy "Public read access to public_uploads"
  on storage.objects
  for select
  using (bucket_id = 'public_uploads');

-- Allow anonymous users to upload (INSERT) into this bucket
create policy "Anon can insert into public_uploads"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'public_uploads');

-- Allow authenticated users to upload as well
create policy "Authenticated can insert into public_uploads"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'public_uploads');

-- Intentionally omit UPDATE and DELETE policies to prevent modifications/removals