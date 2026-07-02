import { supabase } from "@/integrations/supabase/client";

// Photos and strips buckets are private. Fetch a signed URL at read time so
// storage RLS (owner-only + public event photos) is enforced.
export async function signedUrl(
  bucket: "photos" | "strips",
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function signMany<T extends { storage_path: string }>(
  bucket: "photos" | "strips",
  rows: T[],
  expiresIn = 3600,
): Promise<(T & { url: string | null })[]> {
  if (!rows.length) return [];
  const paths = rows.map((r) => r.storage_path);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, expiresIn);
  if (error || !data) return rows.map((r) => ({ ...r, url: null }));
  return rows.map((r, i) => ({ ...r, url: data[i]?.signedUrl ?? null }));
}