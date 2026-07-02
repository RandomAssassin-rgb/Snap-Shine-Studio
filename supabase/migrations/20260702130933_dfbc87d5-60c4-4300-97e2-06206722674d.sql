
-- Public read for photos and strips (they hold sharable event/download URLs; RLS on public.photos still gates listing by is_public)
CREATE POLICY "Photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Strips public read" ON storage.objects FOR SELECT USING (bucket_id = 'strips');

-- Users manage files under their own folder: <bucket>/<user_id>/...
CREATE POLICY "Users upload own photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own strips" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'strips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own strips" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'strips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own strips" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'strips' AND (storage.foldername(name))[1] = auth.uid()::text);
