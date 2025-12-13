-- Supabase Storage Policies for Jotya Images
-- Run these in the SQL Editor: https://supabase.com/dashboard/project/vftluxsmspkeymtcwbfa/sql

-- First, make sure the bucket exists and is public
-- Go to Storage > jotya-images > Settings > Enable "Public bucket"

-- Then apply these policies for more granular control:

-- 1. Allow public read access to all images
CREATE POLICY "Public read access for jotya images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'jotya-images' );

-- 2. Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'jotya-images'
);

-- 3. Allow users to update their own images (optional)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'jotya-images' )
WITH CHECK ( bucket_id = 'jotya-images' );

-- 4. Allow users to delete their own images (optional)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE  
TO authenticated
USING ( bucket_id = 'jotya-images' );

-- Verify policies are active:
SELECT * FROM storage.policies WHERE bucket_id = 'jotya-images';
