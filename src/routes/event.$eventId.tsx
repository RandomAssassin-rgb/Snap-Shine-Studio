import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, Download, Play, Pause } from "lucide-react";
import { signedUrl } from "@/lib/storage";

export const Route = createFileRoute("/event/$eventId")({
  head: () => ({ meta: [
    { title: "Live event gallery — SnapBooth" },
    { name: "description", content: "Live photobooth gallery. Photos appear as guests take them." },
  ] }),
  component: EventPage,
});

interface EventRow { id: string; name: string; is_live: boolean; }
interface PhotoRow { id: string; storage_path: string; created_at: string; url?: string | null; }

function EventPage() {
  const { eventId } = Route.useParams();
  const [ev, setEv] = useState<EventRow | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [slideshow, setSlideshow] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    (async () => {
      // join_code intentionally omitted — visible only to owner via /account.
      const { data } = await supabase.from("events").select("id,name,is_live").eq("id", eventId).maybeSingle();
      if (!data) { setNotFound(true); return; }
      setEv(data);
      const { data: ph } = await supabase
        .from("photos")
        .select("id,storage_path,created_at")
        .eq("event_id", eventId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      const rows = (ph ?? []) as PhotoRow[];
      const withUrls = await Promise.all(
        rows.map(async (p) => ({ ...p, url: await signedUrl("photos", p.storage_path) })),
      );
      setPhotos(withUrls);
    })();
  }, [eventId]);

  useEffect(() => {
    const channel = supabase
      .channel(`event-${eventId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "photos", filter: `event_id=eq.${eventId}` }, async (payload) => {
        const row = payload.new as PhotoRow & { is_public: boolean };
        if (!row.is_public) return;
        const url = await signedUrl("photos", row.storage_path);
        setPhotos((prev) => [{ ...row, url }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  useEffect(() => {
    if (!slideshow || photos.length === 0) return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [slideshow, photos.length]);

  if (notFound) return (
    <div className="min-h-screen bg-gradient-soft"><SiteHeader /><p className="p-8 text-center">Event not found.</p></div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">{ev?.name ?? "Event"}</h1>
            <p className="text-sm text-muted-foreground">
              {photos.length} photo{photos.length === 1 ? "" : "s"}
              {ev && !ev.is_live && " · Not live"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSlideshow(!slideshow)} disabled={!photos.length}>
              {slideshow ? <><Pause className="mr-1 h-4 w-4" />Pause</> : <><Play className="mr-1 h-4 w-4" />Slideshow</>}
            </Button>
            <Link to="/booth" search={{ eventId } as never}><Button><Camera className="mr-1 h-4 w-4" />Contribute</Button></Link>
          </div>
        </div>

        {slideshow && photos.length > 0 && (
          <div className="mb-4 flex items-center justify-center rounded-2xl bg-black p-4">
            <img src={photos[slideIdx].url ?? ""} alt="" className="max-h-[70vh] rounded-lg" />
          </div>
        )}

        {photos.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No photos yet. Be the first to snap one!</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 [column-fill:_balance]">
            {photos.map((p) => (
              <div key={p.id} className="mb-3 break-inside-avoid overflow-hidden rounded-xl bg-card shadow-tape">
                {p.url && (
                  <>
                    <img src={p.url} loading="lazy" alt="" className="w-full" />
                    <a href={p.url} download className="flex items-center justify-end p-1 text-xs">
                      <Download className="h-3 w-3" />
                    </a>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}