import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { generateQR } from "@/lib/share";
import { Copy, QrCode, Plus } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "Account — SnapBooth" },
    { name: "description", content: "Manage your account and event galleries." },
  ] }),
  component: AccountPage,
});

interface Event { id: string; name: string; slug: string; join_code: string; is_live: boolean; }

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [qr, setQr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    (async () => {
      const { data: p } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      setName(p?.display_name ?? "");
      const { data: ev } = await supabase.from("events").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setEvents(ev ?? []);
    })();
  }, [user, loading, navigate]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: name });
    if (error) toast.error(error.message); else toast.success("Saved.");
  };

  const createEvent = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) + "-" + randSlug(4);
    const join_code = randCode(6);
    const { data, error } = await supabase.from("events").insert({
      owner_id: user.id, name: newName.trim(), slug, join_code,
    }).select().single();
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    setEvents((prev) => [data as Event, ...prev]);
    setNewName("");
    toast.success("Event created.");
  };

  const toggleLive = async (ev: Event) => {
    const { error } = await supabase.from("events").update({ is_live: !ev.is_live }).eq("id", ev.id);
    if (error) toast.error(error.message);
    else setEvents((prev) => prev.map(e => e.id === ev.id ? { ...e, is_live: !e.is_live } : e));
  };

  const showQR = async (ev: Event) => {
    const url = `${window.location.origin}/event/${ev.id}`;
    const q = await generateQR(url, 512);
    setQr((prev) => ({ ...prev, [ev.id]: q }));
  };

  const copyLink = async (ev: Event) => {
    const url = `${window.location.origin}/event/${ev.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Link copied.");
  };

  if (loading || !user) return <div className="min-h-screen bg-gradient-soft"><SiteHeader /></div>;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-6 p-4">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-2xl">Profile</h2>
          <div className="mt-4 max-w-md space-y-3">
            <div>
              <Label>Email</Label>
              <Input value={user.email ?? ""} disabled />
            </div>
            <div>
              <Label>Display name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile}>Save</Button>
              <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>Sign out</Button>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Event galleries</h2>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">Create a shareable live gallery. Anyone with the link can see photos guests contribute.</p>
          <div className="flex gap-2">
            <Input placeholder="Event name (e.g. Sam & Jo Wedding)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Button onClick={createEvent} disabled={!newName.trim() || creating}><Plus className="mr-1 h-4 w-4" />Create</Button>
          </div>

          <div className="mt-4 space-y-3">
            {events.length === 0 && <p className="text-sm text-muted-foreground">No events yet.</p>}
            {events.map((ev) => (
              <div key={ev.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{ev.name}</p>
                    <p className="text-xs text-muted-foreground">Join code: <b className="font-mono">{ev.join_code}</b></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Live</Label>
                    <Switch checked={ev.is_live} onCheckedChange={() => toggleLive(ev)} />
                    <Button size="sm" variant="outline" onClick={() => copyLink(ev)}><Copy className="mr-1 h-3 w-3" />Copy link</Button>
                    <Button size="sm" variant="outline" onClick={() => showQR(ev)}><QrCode className="mr-1 h-3 w-3" />QR</Button>
                    <Link to="/event/$eventId" params={{ eventId: ev.id }}><Button size="sm">Open</Button></Link>
                  </div>
                </div>
                {qr[ev.id] && <img src={qr[ev.id]} alt="QR" className="mt-3 h-40 w-40 rounded-lg border" />}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function randCode(len: number) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
const randSlug = (n: number) => Math.random().toString(36).slice(2, 2 + n);