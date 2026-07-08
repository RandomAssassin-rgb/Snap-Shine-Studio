import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, Download, Trash2, Wand2, Printer } from "lucide-react";
import { toast } from "sonner";
import { signMany } from "@/lib/storage";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Gallery — SnapBooth" },
    { name: "description", content: "Your saved photobooth strips." },
  ] }),
  component: GalleryPage,
});

interface StripRow { id: string; public_url: string | null; template: string; created_at: string; session_id: string | null; storage_path: string; url?: string | null; }

function GalleryPage() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<StripRow[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { setBusy(false); return; }
    (async () => {
      const { data, error } = await supabase.from("strips").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      const signed = await signMany("strips", (data ?? []) as StripRow[]);
      setRows(signed);
      setBusy(false);
    })();
  }, [user, loading]);

  const del = async (row: StripRow) => {
    if (!confirm("Delete this strip?")) return;
    await supabase.storage.from("strips").remove([row.storage_path]);
    await supabase.from("strips").delete().eq("id", row.id);
    setRows((prev) => prev.filter(r => r.id !== row.id));
    toast.success("Deleted.");
  };

  if (loading || busy) return (
    <div className="min-h-screen bg-gradient-soft"><SiteHeader /><p className="p-8 text-center text-muted-foreground">Loading…</p></div>
  );
  if (!user) return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <div className="mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-3xl">Sign in to see your gallery</h1>
        <p className="mt-2 text-muted-foreground">Your saved strips live here.</p>
        <Link to="/auth"><Button className="mt-6">Sign in</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-4xl">Your gallery</h1>
          <Link to="/booth"><Button><Camera className="mr-1 h-4 w-4" />New strip</Button></Link>
        </div>

        {rows.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">No strips yet. Take your first one.</p>
            <Link to="/booth"><Button className="mt-4"><Camera className="mr-1 h-4 w-4" />Open the booth</Button></Link>
          </div>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [column-fill:_balance]">
            {rows.map((r) => (
              <div key={r.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-card shadow-tape">
                {r.url && <img src={r.url} alt="Strip" loading="lazy" className="w-full" />}
                <div className="flex items-center justify-between p-2 text-xs">
                  <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <Link to="/edit/$stripId" params={{ stripId: r.id }}><Button size="icon" variant="ghost" title="Edit"><Wand2 className="h-4 w-4" /></Button></Link>
                    <Link to="/print/$stripId" params={{ stripId: r.id }}><Button size="icon" variant="ghost" title="Print"><Printer className="h-4 w-4" /></Button></Link>
                    {r.url && <a href={r.url} download><Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button></a>}
                    <Button size="icon" variant="ghost" onClick={() => del(r)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}