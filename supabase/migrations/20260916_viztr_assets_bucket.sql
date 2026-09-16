-- Ensure viztr-assets bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'viztr-assets',
  'viztr-assets',
  true,
  524288000, -- 500MB
  ARRAY['image/*', 'video/*', 'model/*', 'application/octet-stream', 'application/json']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['image/*', 'video/*', 'model/*', 'application/octet-stream', 'application/json'];
