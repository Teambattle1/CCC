-- Create storage bucket for TeamBox files (images and PDFs)
-- Run this in Supabase SQL Editor

-- Create the storage bucket (if using SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('teambox-files', 'teambox-files', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all files
CREATE POLICY "Allow authenticated users to read teambox files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'teambox-files');

-- Policy: Allow public read access (for public URLs)
CREATE POLICY "Allow public read access for teambox files"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'teambox-files');

-- Policy: Allow ADMIN and GAMEMASTER to upload files
CREATE POLICY "Allow admin upload to teambox files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teambox-files' AND
  (auth.jwt() ->> 'role')::text IN ('ADMIN', 'GAMEMASTER')
);

-- Policy: Allow ADMIN and GAMEMASTER to delete files
CREATE POLICY "Allow admin delete from teambox files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teambox-files' AND
  (auth.jwt() ->> 'role')::text IN ('ADMIN', 'GAMEMASTER')
);

-- Note: You can also create the bucket via Supabase Dashboard:
-- 1. Go to Storage in your Supabase project
-- 2. Click "New bucket"
-- 3. Name: teambox-files
-- 4. Public bucket: Yes (for public URLs)
-- 5. Add the policies above via SQL or Dashboard
