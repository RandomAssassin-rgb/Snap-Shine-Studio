import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Images, Calendar, HardDrive, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { signMany } from "@/lib/storage";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SnapBooth" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

interface Stats { sessions: number; strips: number; events: number; photos: number; }

function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<{ id: string; created_at: string; template: string; storage_path: string; url?: string | null }[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(Boolean(data));
      if (data) {
        const [ses, str, ev, ph, rec] = await Promise.all([
          supabase.from("sessions").select("*", { count: "exact", head: true }),
          supabase.from("strips").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
          supabase.from("photos").select("*", { count: "exact", head: true }),
          supabase.from("strips").select("id,created_at,template,storage_path").order("created_at", { ascending: false }).limit(12),
        ]);
        setStats({ sessions: ses.count ?? 0, strips: str.count ?? 0, events: ev.count ?? 0, photos: ph.count ?? 0 });
        setRecent(await signMany("strips", rec.data ?? []));
      }
    })();
  }, [user, loading]);

  if (loading || isAdmin === null) return <div className="min-h-screen bg-gradient-soft"><SiteHeader /><p className="p-8 text-center text-muted-foreground">Loading…</p></div>;
  if (!user || !isAdmin) return (
    <div className="min-h-screen bg-gradient-soft"><SiteHeader />
      <main className="mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have the admin role. Ask an existing admin to grant it.</p>
        <Link to="/"><Button variant="outline" className="mt-6">Back home</Button></Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        <h1 className="font-display text-4xl">Admin dashboard</h1>
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats && [
            { label: "Sessions", value: stats.sessions, Icon: Camera },
            { label: "Strips", value: stats.strips, Icon: Images },
            { label: "Events", value: stats.events, Icon: Calendar },
            { label: "Photos", value: stats.photos, Icon: HardDrive },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground"><Icon className="h-4 w-4" />{label}</div>
              <div className="mt-2 font-display text-3xl">{value.toLocaleString()}</div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl">Recent strips</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recent.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-xl bg-card shadow-tape">
                {r.url && <img src={r.url} alt="Strip" className="w-full" loading="lazy" />}
                <div className="p-1 text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}