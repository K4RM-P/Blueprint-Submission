-- C3: the public logos bucket accepts raster images only (an SVG could carry script).
-- The upload server action also checks the file's magic bytes (lib/validation/organization.ts sniffLogoType).
update storage.buckets set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'] where id = 'logos';
