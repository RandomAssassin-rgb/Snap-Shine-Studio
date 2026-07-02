-- Replace the SECURITY DEFINER view with column-level privileges.
DROP VIEW IF EXISTS public.events_public;

-- Re-add public SELECT on live events, but only for safe columns via GRANTs.
DROP POLICY IF EXISTS "Anyone can view live events" ON public.events;
CREATE POLICY "Anyone can view live events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (is_live = true);

-- anon can only SELECT the safe columns; join_code is not granted to anon.
REVOKE SELECT ON public.events FROM anon;
GRANT SELECT (id, name, slug, is_live, owner_id, created_at) ON public.events TO anon;