import { createFileRoute, Link, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, RefreshCw, Repeat, Volume2, VolumeX, Download, Share2, Save, Trash2, Sparkles, ChevronsUpDown, Sun, Search } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { useCamera } from "@/hooks/use-camera";
import { useAuth } from "@/hooks/use-auth";
import { FILTERS, DEFAULT_ADJUST, combineFilterCss, getFilter, type FilterId, type LiveAdjust } from "@/lib/filters";
import { LAYOUTS, LAYOUT_CATEGORIES, getLayout, type LayoutId, type LayoutDef } from "@/lib/layouts";
import { renderStrip, downloadBlob } from "@/lib/strip";
import { shareOrCopy, shareLinks } from "@/lib/share";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/booth")({
  head: () => ({ meta: [
    { title: "Booth - Snap & Shine Studio" },
    { name: "description", content: "Take photos, pick filters, and generate strips in the browser." },
  ] }),
  component: BoothPageWrapper,
});

function BoothPageWrapper() {
  const location = useLocation();
  if (location.pathname.startsWith("/booth/")) {
    return <Outlet />;
  }
  return <BoothPage />;
}

type CountdownOpt = 0 | 3 | 5 | 10;

function BoothPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cam = useCamera();
  const [filterId, setFilterId] = useState<FilterId>("normal");
  const [adjust, setAdjust] = useState<LiveAdjust>(DEFAULT_ADJUST);
  const [layoutId, setLayoutId] = useState<LayoutId>("three");
  const [countdown, setCountdown] = useState<CountdownOpt>(3);
  const [flash, setFlash] = useState(true);
  const [sound, setSound] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [shots, setShots] = useState<HTMLCanvasElement[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const [stripBlob, setStripBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  const filter = getFilter(filterId);
  const filterCss = useMemo(() => combineFilterCss(filter, adjust), [filter, adjust]);
  const layout = getLayout(layoutId);
  const currentShotIdx = shots.length;

  // Start camera on mount
  useEffect(() => { cam.start(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Shutter sfx via WebAudio (no asset needed)
  const playShutter = useCallback(() => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.setValueAtTime(1200, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.08);
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.13);
      setTimeout(() => ac.close(), 200);
    } catch { /* ignore */ }
  }, [sound]);

  const speak = useCallback((text: string) => {
    if (!sound) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1; u.pitch = 1.05; u.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }, [sound]);

  const doCapture = useCallback(() => {
    const canvas = cam.capture(filterCss, cam.mirror);
    if (!canvas) { toast.error("Camera not ready"); return null; }
    // Flash effect
    if (flash) {
      setFlashOn(true);
      setTimeout(() => setFlashOn(false), 150);
    }
    playShutter();
    return canvas;
  }, [cam, filterCss, flash, playShutter]);

  const runCountdownAndCapture = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const need = Math.max(0, layout.shots - shots.length);
      const per = need > 1 ? 1 : 1; // still count per shot
      for (let i = 0; i < need; i++) {
        if (countdown > 0) {
          for (let n = countdown; n >= 1; n--) {
            setCountdownNum(n);
            speak(String(n));
            await sleep(1000);
          }
          setCountdownNum(null);
        }
        const canvas = doCapture();
        if (canvas) setShots((prev) => [...prev, canvas]);
        if (i < need - 1) await sleep(700);
        void per;
      }
    } finally {
      setCapturing(false);
    }
  }, [capturing, countdown, doCapture, layout.shots, shots.length, speak]);

  const retakeShot = (idx: number) => {
    setShots((prev) => prev.filter((_, i) => i !== idx));
    setStripUrl(null); setStripBlob(null); setPublicUrl(null);
  };

  const clearAll = () => {
    setShots([]); setStripUrl(null); setStripBlob(null); setPublicUrl(null);
  };

  // Auto-generate strip when all shots taken
  useEffect(() => {
    if (shots.length === layout.shots && shots.length > 0) {
      renderStrip(shots, layout).then(({ blob, dataUrl }) => {
        setStripBlob(blob);
        setStripUrl(dataUrl);
      }).catch(() => toast.error("Failed to render strip"));
    } else {
      setStripUrl(null); setStripBlob(null); setPublicUrl(null);
    }
  }, [shots, layout]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName?.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.code === "Space") { e.preventDefault(); runCountdownAndCapture(); }
      if (e.key.toLowerCase() === "r" && shots.length) { setShots((p) => p.slice(0, -1)); }
      if (e.key.toLowerCase() === "m") { cam.setMirror(!cam.mirror); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runCountdownAndCapture, shots.length, cam]);

  const download = () => {
    if (!stripBlob) return;
    downloadBlob(stripBlob, `snapbooth-${Date.now()}.jpg`);
  };

  const uploadAndSave = async () => {
    if (!stripBlob) return;
    if (!user) { toast.info("Sign in to save to your gallery."); navigate({ to: "/auth" }); return; }
    setUploading(true);
    try {
      // Create session
      const { data: sess, error: sErr } = await supabase.from("sessions").insert({
        user_id: user.id, layout: layout.id, filter: filter.id, template: "classic",
      }).select().single();
      if (sErr) throw sErr;

      // Upload each individual shot
      const uploadedPhotoIds: string[] = [];
      for (let i = 0; i < shots.length; i++) {
        const c = shots[i];
        const b = await new Promise<Blob>((res, rej) =>
          c.toBlob((bl) => (bl ? res(bl) : rej(new Error("blob"))), "image/jpeg", 0.9)
        );
        const path = `${user.id}/${sess.id}/shot-${i}.jpg`;
        const { error: upErr } = await supabase.storage.from("photos").upload(path, b, { upsert: true, contentType: "image/jpeg" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
        const { data: photo, error: phErr } = await supabase.from("photos").insert({
          user_id: user.id, session_id: sess.id, storage_path: path, public_url: pub.publicUrl,
          order_idx: i, width: c.width, height: c.height, is_public: false,
        }).select().single();
        if (phErr) throw phErr;
        uploadedPhotoIds.push(photo.id);
      }

      // Upload strip
      const stripPath = `${user.id}/${sess.id}/strip.jpg`;
      const { error: sUpErr } = await supabase.storage.from("strips").upload(stripPath, stripBlob, { upsert: true, contentType: "image/jpeg" });
      if (sUpErr) throw sUpErr;
      const { data: sPub } = supabase.storage.from("strips").getPublicUrl(stripPath);
      await supabase.from("strips").insert({
        user_id: user.id, session_id: sess.id, storage_path: stripPath,
        public_url: sPub.publicUrl, template: "classic",
      });
      setPublicUrl(sPub.publicUrl);
      toast.success("Saved to your gallery!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const doShare = async () => {
    if (!stripBlob) return;
    const file = new File([stripBlob], "snapbooth.jpg", { type: "image/jpeg" });
    const url = publicUrl ?? window.location.origin;
    const r = await shareOrCopy({ title: "SnapBooth strip", text: "My photobooth strip 📸", url, files: [file] });
    if (r.method === "clipboard") toast.success("Link copied to clipboard.");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] gap-6 px-4 py-6 lg:grid lg:grid-cols-[112px_1fr_380px]">
        {/* VERTICAL FILTER RAIL */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-3xl border border-gold/20 bg-card/60 p-3 shadow-pop backdrop-blur">
            <p className="mb-3 px-1 text-center text-[9px] uppercase tracking-[0.32em] text-gold">Filtres</p>
            <div className="hairline mb-3" />
            <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
              {FILTERS.map((f) => {
                const active = filterId === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilterId(f.id)}
                    className={`group relative flex w-full flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                      active
                        ? "border-gold/70 bg-gradient-gold text-primary-foreground shadow-glow"
                        : "border-transparent hover:border-gold/30 hover:bg-secondary/60"
                    }`}
                    title={f.label}
                  >
                    <span
                      aria-hidden
                      className={`h-10 w-10 rounded-xl ring-1 ring-inset ${active ? "ring-white/40" : "ring-border/60"}`}
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg,#8a6a2c 0%,#d4af5a 45%,#3a2a1a 100%)",
                        filter: f.css === "none" ? undefined : f.css,
                      }}
                    />
                    <span className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CAMERA COLUMN */}
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-black shadow-pop">
            {/* Video preview */}
            <div className="relative aspect-video w-full">
              <video
                ref={cam.videoRef}
                autoPlay muted playsInline
                className="h-full w-full object-cover"
                style={{
                  filter: filterCss,
                  transform: cam.mirror ? "scaleX(-1)" : "none",
                }}
              />
              {/* Filter color overlay */}
              {filter.overlay && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundColor: filter.overlay.color,
                    mixBlendMode: filter.overlay.blend as React.CSSProperties["mixBlendMode"],
                    opacity: filter.overlay.opacity,
                  }}
                />
              )}

              {/* Progress dots */}
              {layout.shots > 1 && (
                <div className="absolute left-4 top-4 flex gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
                  {Array.from({ length: layout.shots }).map((_, i) => (
                    <span key={i} className={`h-2 w-2 rounded-full ${i < currentShotIdx ? "bg-white" : "bg-white/30"}`} />
                  ))}
                </div>
              )}

              {/* Flash */}
              <AnimatePresence>
                {flashOn && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 0.95 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="pointer-events-none absolute inset-0 bg-white"
                  />
                )}
              </AnimatePresence>

              {/* Countdown */}
              <AnimatePresence>
                {countdownNum !== null && (
                  <motion.div
                    key={countdownNum}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  >
                    <span className="font-display text-[16rem] font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                      {countdownNum}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera status overlays */}
              {cam.status !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-white">
                  {cam.status === "requesting" && <p>Requesting camera access…</p>}
                  {cam.status === "denied" && (
                    <div>
                      <p className="mb-2 font-display text-xl">Camera access blocked</p>
                      <p className="mb-4 text-sm opacity-80">Allow camera in your browser's site settings, then reload.</p>
                      <Button variant="secondary" onClick={() => cam.start()}>Try again</Button>
                    </div>
                  )}
                  {cam.status === "no-camera" && (
                    <div>
                      <p className="mb-2 font-display text-xl">No camera detected</p>
                      <p className="text-sm opacity-80">{cam.error}</p>
                    </div>
                  )}
                  {cam.status === "error" && (
                    <div>
                      <p className="mb-2 font-display text-xl">Camera error</p>
                      <p className="mb-4 text-sm opacity-80">{cam.error}</p>
                      <Button variant="secondary" onClick={() => cam.start()}>Retry</Button>
                    </div>
                  )}
                  {cam.status === "idle" && (
                    <Button onClick={() => cam.start()}><Camera className="mr-2 h-4 w-4" />Open camera</Button>
                  )}
                </div>
              )}
            </div>

            {/* Controls bar */}
            <div className="flex flex-wrap items-center gap-2 bg-card p-3">
              <Button size="lg" onClick={runCountdownAndCapture} disabled={capturing || cam.status !== "ready" || shots.length >= layout.shots} className="flex-1 min-w-[180px]">
                <Camera className="mr-2 h-5 w-5" />
                {shots.length >= layout.shots ? "Strip ready" : `Capture (${shots.length}/${layout.shots})`}
              </Button>
              <Button variant="outline" size="icon" onClick={() => cam.switchCamera()} title="Switch camera">
                <Repeat className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => cam.setMirror(!cam.mirror)} title="Mirror">
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setSound(!sound)} title="Sound">
                {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {shots.length > 0 && (
                <Button variant="outline" size="icon" onClick={clearAll} title="Clear all shots">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Shot thumbnails */}
          {shots.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {shots.map((c, i) => (
                <div key={i} className="relative">
                  <img
                    src={c.toDataURL("image/jpeg", 0.6)}
                    className="h-24 w-32 rounded-lg object-cover shadow-tape"
                    alt={`Shot ${i + 1}`}
                  />
                  <button
                    onClick={() => retakeShot(i)}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-tape"
                    title="Retake"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mobile filter strip (lg rail replaces this on desktop) */}
          <div className="mt-4 lg:hidden">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">Filters</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterId(f.id)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
                    filterId === f.id
                      ? "border-gold bg-gradient-gold text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDE PANEL */}
        <aside className="mt-6 space-y-4 lg:mt-0">
          {/* Strip preview */}
          {stripUrl && (
            <div className="glass rounded-2xl p-4 shadow-pop">
              <p className="mb-2 flex items-center gap-2 font-display text-lg">
                <Sparkles className="h-4 w-4" /> Your strip
              </p>
              <img src={stripUrl} alt="Your photobooth strip" className="mx-auto max-h-96 rounded-lg shadow-tape" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" onClick={download}><Download className="mr-1 h-4 w-4" />Save</Button>
                <Button size="sm" variant="secondary" onClick={uploadAndSave} disabled={uploading}>
                  <Save className="mr-1 h-4 w-4" />{uploading ? "…" : "Cloud"}
                </Button>
                <Button size="sm" variant="outline" onClick={doShare}><Share2 className="mr-1 h-4 w-4" />Share</Button>
              </div>
              {publicUrl && (
                <div className="mt-3 flex flex-wrap gap-1 text-xs">
                  <a className="underline" target="_blank" rel="noreferrer" href={shareLinks(publicUrl).whatsapp}>WhatsApp</a> ·
                  <a className="underline" target="_blank" rel="noreferrer" href={shareLinks(publicUrl).telegram}>Telegram</a> ·
                  <a className="underline" target="_blank" rel="noreferrer" href={shareLinks(publicUrl).twitter}>X</a> ·
                  <a className="underline" target="_blank" rel="noreferrer" href={shareLinks(publicUrl).facebook}>Facebook</a>
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="layout">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-baseline justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Templates</p>
                <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{LAYOUTS.length}+ ready</span>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search templates..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Link
                to="/booth/film"
                className="mb-3 flex items-center justify-between rounded-xl border border-gold/40 bg-gradient-gold/10 px-3 py-2 text-xs uppercase tracking-widest text-gold hover:bg-gradient-gold/20"
              >
                <span>Classic Film Strips · premium</span>
                <span aria-hidden>→</span>
              </Link>
              <div className="hairline mb-3" />
              <div className="max-h-[520px] space-y-5 overflow-y-auto pr-1">
                {LAYOUT_CATEGORIES.map((cat) => {
                  const items = LAYOUTS.filter((l) => (l.category ?? "Classic") === cat && l.label.toLowerCase().includes(searchQuery.toLowerCase()));
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{cat}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {items.map((l) => (
                          <TemplateTile
                            key={l.id}
                            layout={l}
                            active={layoutId === l.id}
                            onSelect={() => { setLayoutId(l.id); setShots([]); }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Countdown</p>
                <div className="flex gap-2">
                  {([0, 3, 5, 10] as CountdownOpt[]).map((n) => (
                    <button key={n}
                      onClick={() => setCountdown(n)}
                      className={`flex-1 rounded-lg border py-2 text-sm font-medium ${countdown === n ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
                      {n === 0 ? "Off" : `${n}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Label htmlFor="flash-sw" className="flex items-center gap-2"><Sun className="h-4 w-4" />Flash</Label>
                <Switch id="flash-sw" checked={flash} onCheckedChange={setFlash} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Label htmlFor="sound-sw" className="flex items-center gap-2">
                  {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Sound & voice
                </Label>
                <Switch id="sound-sw" checked={sound} onCheckedChange={setSound} />
              </div>
            </TabsContent>

            <TabsContent value="camera" className="glass rounded-2xl p-4 space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Camera device</Label>
                <Select value={cam.deviceId ?? ""} onValueChange={(v) => cam.start({ deviceId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Choose camera" /></SelectTrigger>
                  <SelectContent>
                    {cam.devices.map((d) => <SelectItem key={d.deviceId} value={d.deviceId}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Mirror preview</Label>
                <Switch checked={cam.mirror} onCheckedChange={cam.setMirror} />
              </div>
              <div className="text-xs text-muted-foreground">
                Shortcuts: <b>Space</b> = capture · <b>R</b> = retake last · <b>M</b> = mirror
              </div>
            </TabsContent>

            <TabsContent value="adjust" className="glass rounded-2xl p-4 space-y-4">
              {(["brightness", "contrast", "saturation"] as const).map((k) => (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="capitalize">{k}</span>
                    <span className="tabular-nums">{adjust[k].toFixed(2)}</span>
                  </div>
                  <Slider min={0} max={2} step={0.05} value={[adjust[k]]} onValueChange={([v]) => setAdjust({ ...adjust, [k]: v })} />
                </div>
              ))}
              <div>
                <div className="mb-1 flex items-center justify-between text-xs"><span>Hue</span><span>{adjust.hue}°</span></div>
                <Slider min={-180} max={180} step={5} value={[adjust.hue]} onValueChange={([v]) => setAdjust({ ...adjust, hue: v })} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs"><span>Blur</span><span>{adjust.blur.toFixed(1)}px</span></div>
                <Slider min={0} max={8} step={0.5} value={[adjust.blur]} onValueChange={([v]) => setAdjust({ ...adjust, blur: v })} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAdjust(DEFAULT_ADJUST)}>Reset</Button>
            </TabsContent>
          </Tabs>

        </aside>
      </main>
    </div>
  );
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function TemplateTile({
  layout,
  active,
  onSelect,
}: {
  layout: LayoutDef;
  active: boolean;
  onSelect: () => void;
}) {
  // Miniature preview mimicking the strip: bg + N stacked cells + optional label bar
  const cells = Array.from({ length: Math.min(layout.shots, layout.cols * layout.rows) });
  return (
    <button
      onClick={onSelect}
      title={`${layout.label} · ${layout.shots} shot${layout.shots > 1 ? "s" : ""}`}
      className={`group relative flex flex-col items-center gap-1 rounded-xl border p-1.5 transition ${
        active ? "border-gold/70 bg-gradient-gold text-primary-foreground shadow-glow" : "border-border/60 bg-card hover:border-gold/40 hover:bg-secondary/60"
      }`}
    >
      <div
        className="relative w-full overflow-hidden rounded-md ring-1 ring-black/10"
        style={{
          backgroundColor: layout.bg,
          aspectRatio: `${layout.width} / ${layout.height}`,
        }}
      >
        {layout.accent && (
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: layout.accent }} />
        )}
        <div
          className="absolute inset-0 grid"
          style={{
            padding: 4,
            gap: 2,
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
            paddingBottom: layout.labelText ? 12 : 4,
          }}
        >
          {cells.map((_, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(0,0,0,0.25))",
              }}
            />
          ))}
        </div>
        {layout.labelText && (
          <div
            className="absolute inset-x-0 bottom-0 truncate px-1 pb-0.5 text-center text-[6px] uppercase tracking-[0.16em]"
            style={{ color: layout.labelColor ?? "#001858" }}
          >
            {layout.emoji ? `${layout.emoji} ` : ""}{layout.labelText}
          </div>
        )}
      </div>
      <span className={`w-full truncate text-[9px] font-medium uppercase tracking-[0.14em] ${active ? "text-primary-foreground" : "text-foreground/80"}`}>
        {layout.label}
      </span>
    </button>
  );
}