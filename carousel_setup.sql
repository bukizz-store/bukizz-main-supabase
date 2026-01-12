-- Create a new public bucket for carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel_images', 'carousel_images', true);

-- Allow public read access (anyone can view images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'carousel_images' );

-- Allow authenticated users to upload images (for Admin Panel later)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'carousel_images' );

-- Allow authenticated users to update/delete (optional, for management)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'carousel_images' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'carousel_images' );
