-- Fix 1: events.join_code was exposed via a public SELECT policy.
DROP POLICY IF EXISTS "Anyone can view live events" ON public.events;

DROP VIEW IF EXISTS public.events_public;
CREATE VIEW public.events_public
WITH (security_invoker = off) AS
SELECT id, name, slug, is_live, owner_id, created_at
FROM public.events
WHERE is_live = true;

GRANT SELECT ON public.events_public TO anon, authenticated;

-- Fix 2: storage.objects had blanket public SELECT on photos/strips.
DROP POLICY IF EXISTS "Photos public read" ON storage.objects;
DROP POLICY IF EXISTS "Strips public read" ON storage.objects;

CREATE POLICY "Owners read own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Owners read own strips"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'strips'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Public event photos readable"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'photos'
  AND EXISTS (
    SELECT 1 FROM public.photos p
    WHERE p.storage_path = storage.objects.name
      AND p.is_public = true
  )
);