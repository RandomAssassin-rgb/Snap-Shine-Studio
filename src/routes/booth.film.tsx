import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera, RefreshCw, Repeat, Volume2, VolumeX, Download, Save, Trash2, Star, StarOff,
  MoreVertical, Copy, Pencil, Sparkles, ChevronsUpDown, Sun, Search, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { useCamera } from "@/hooks/use-camera";
import { useAuth } from "@/hooks/use-auth";
import { FILM_STRIP_PRESETS, getFilmStripPreset } from "@/lib/film-strip-presets";
import type { FilmStripConfig } from "@/lib/film-strip";
import { totalShots } from "@/lib/film-strip";
import { FilmStripPreview } from "@/components/film-strip/FilmStripPreview";
import { FilmStripEditor } from "@/components/film-strip/FilmStripEditor";
import { SortableShots } from "@/components/film-strip/SortableShots";
import { EXPORT_SIZES, exportFilmStrip, downloadBlob, type ExportFormat } from "@/lib/film-strip-export";
import { filmStripLibrary, type StoredTemplate } from "@/lib/film-strip-library";

export const Route = createFileRoute("/booth/film")({
  head: () => ({ meta: [
    { title: "Classic Film Strips — Snap & Shine Studio" },
    { name: "description", content: "Premium dual vertical film strip templates with live editing, drag reordering and print-quality export." },
  ] }),
  component: FilmBoothPage,
});

type CountdownOpt = 0 | 3 | 5 | 10;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function FilmBoothPage() {
  const { user } = useAuth();
  const cam = useCamera();

  const [presetId, setPresetId] = useState<string>(FILM_STRIP_PRESETS[0].id);
  const [config, setConfig] = useState<FilmStripConfig>(FILM_STRIP_PRESETS[0]);
  const [shots, setShots] = useState<HTMLCanvasElement[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState<CountdownOpt>(3);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [flash, setFlash] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [sound, setSound] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportSize, setExportSize] = useState(EXPORT_SIZES[0].id);
  const [customTemplates, setCustomTemplates] = useState<StoredTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const editorOpenRef = useRef(false);

  useEffect(() => { cam.start(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    setCustomTemplates(filmStripLibrary.list());
    setFavorites(filmStripLibrary.favorites());
  }, []);

  const need = totalShots(config);

  const applyPreset = (cfg: FilmStripConfig) => {
    setPresetId(cfg.id);
    setConfig(cfg);
    setShots([]);
  };

  // Shutter + voice
  const playShutter = useCallback(() => {
    if (!sound) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      const o = ac.createOscillator(); const g = ac.createGain();
      o.frequency.setValueAtTime(1200, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.08);
      g.gain.setValueAtTime(0.25, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      o.connect(g).connect(ac.destination);
      o.start(); o.stop(ac.currentTime + 0.13);
      setTimeout(() => ac.close(), 200);
    } catch { /* ignore */ }
  }, [sound]);
  const speak = useCallback((t: string) => {
    if (!sound) return;
    try {
      const u = new SpeechSynthesisUtterance(t);
      u.rate = 1.1; u.pitch = 1.05; u.volume = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  }, [sound]);

  const doCapture = useCallback(() => {
    const c = cam.capture("none", cam.mirror);
    if (!c) { toast.error("Camera not ready"); return null; }
    if (flash) { setFlashOn(true); setTimeout(() => setFlashOn(false), 150); }
    playShutter();
    return c;
  }, [cam, flash, playShutter]);

  const runCaptureAll = useCallback(async () => {
    if (capturing) return;
    setCapturing(true);
    try {
      const remaining = Math.max(0, need - shots.length);
      for (let i = 0; i < remaining; i++) {
        if (countdown > 0) {
          for (let n = countdown; n >= 1; n--) {
            setCountdownNum(n); speak(String(n)); await sleep(1000);
          }
          setCountdownNum(null);
        }
        const c = doCapture();
        if (c) setShots((prev) => [...prev, c]);
        if (i < remaining - 1) await sleep(500);
      }
    } finally {
      setCapturing(false);
    }
  }, [capturing, countdown, doCapture, need, shots.length, speak]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editorOpenRef.current) return;
      const t = e.target as HTMLElement | null;
      if (t?.tagName?.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.code === "Space") { e.preventDefault(); runCaptureAll(); }
      if (e.key.toLowerCase() === "m") cam.setMirror(!cam.mirror);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runCaptureAll, cam]);

  const currentSize = useMemo(
    () => EXPORT_SIZES.find((s) => s.id === exportSize)?.size ?? EXPORT_SIZES[0].size,
    [exportSize],
  );

  const onExport = async () => {
    if (shots.length < need) { toast.error(`Take ${need - shots.length} more shot${need - shots.length > 1 ? "s" : ""} first.`); return; }
    try {
      const { blob, filename } = await exportFilmStrip(shots, config, currentSize, exportFormat);
      downloadBlob(blob, filename);
      toast.success(`Exported ${filename}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const saveCurrentAsTemplate = () => {
    const name = prompt("Name for this template?", `${config.label} (custom)`);
    if (!name) return;
    const t = filmStripLibrary.save({ ...config, label: name });
    setCustomTemplates(filmStripLibrary.list());
    setPresetId(t.key); setConfig(t.config);
    toast.success("Template saved");
  };
  const applyCustom = (t: StoredTemplate) => applyPreset(t.config);
  const duplicateCustom = (key: string) => {
    const t = filmStripLibrary.duplicate(key);
    if (t) { setCustomTemplates(filmStripLibrary.list()); toast.success("Duplicated"); }
  };
  const deleteCustom = (key: string) => {
    filmStripLibrary.remove(key);
    setCustomTemplates(filmStripLibrary.list());
    setFavorites(filmStripLibrary.favorites());
    if (presetId === key) applyPreset(FILM_STRIP_PRESETS[0]);
    toast.success("Deleted");
  };
  const toggleFav = (key: string) => {
    filmStripLibrary.toggleFavorite(key);
    setFavorites(filmStripLibrary.favorites());
  };
  const commitRename = () => {
    if (!renamingKey || !renameValue.trim()) { setRenamingKey(null); return; }
    filmStripLibrary.rename(renamingKey, renameValue.trim());
    setCustomTemplates(filmStripLibrary.list());
    if (presetId === renamingKey) {
      const t = filmStripLibrary.list().find((x) => x.key === renamingKey);
      if (t) setConfig(t.config);
    }
    setRenamingKey(null);
  };

  const clearAll = () => setShots([]);

  return (
    <div className="min-h-screen bg-gradient-soft grain">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] gap-6 py-0 lg:grid lg:grid-cols-[1fr_400px] lg:px-4 lg:py-6">
        {/* LEFT: CAMERA + PREVIEW */}
        <div className="space-y-5 lg:pt-0">
          {/* Camera */}
          <div className="relative overflow-hidden bg-black shadow-pop lg:rounded-3xl">
            <div className="relative aspect-[3/4] w-full sm:aspect-[4/3] lg:aspect-video">
              <video
                ref={cam.videoRef}
                autoPlay muted playsInline
                className="h-full w-full object-cover"
                style={{ transform: cam.mirror ? "scaleX(-1)" : "none" }}
              />
              <div className="absolute left-4 top-4 flex gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur">
                {Array.from({ length: need }).map((_, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${i < shots.length ? "bg-gold" : "bg-white/30"}`} />
                ))}
              </div>
              <AnimatePresence>
                {flashOn && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.95 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="pointer-events-none absolute inset-0 bg-white" />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {countdownNum !== null && (
                  <motion.div key={countdownNum} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.4 }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[16rem] font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">{countdownNum}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {cam.status !== "ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-white">
                  {cam.status === "requesting" && <p>Requesting camera access…</p>}
                  {cam.status === "denied" && <div><p className="font-display text-xl">Camera access blocked</p><Button className="mt-3" variant="secondary" onClick={() => cam.start()}>Try again</Button></div>}
                  {cam.status === "no-camera" && <p>No camera detected</p>}
                  {cam.status === "error" && <div><p className="font-display text-xl">Camera error</p><Button className="mt-3" variant="secondary" onClick={() => cam.start()}>Retry</Button></div>}
                  {cam.status === "idle" && <Button onClick={() => cam.start()}><Camera className="mr-2 h-4 w-4" />Open camera</Button>}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 bg-card p-3">
              <Button size="lg" onClick={runCaptureAll} disabled={capturing || cam.status !== "ready" || shots.length >= need} className="flex-1 min-w-[180px] bg-gradient-gold text-primary-foreground shadow-glow">
                <Camera className="mr-2 h-5 w-5" />
                {shots.length >= need ? "Strip ready" : `Capture (${shots.length}/${need})`}
              </Button>
              <Button variant="outline" size="icon" onClick={() => cam.switchCamera()} title="Switch camera"><Repeat className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => cam.setMirror(!cam.mirror)} title="Mirror"><ChevronsUpDown className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setSound(!sound)} title="Sound">{sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</Button>
              {shots.length > 0 && <Button variant="outline" size="icon" onClick={clearAll} title="Clear"><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>

          {/* Reorder tray */}
          <div className="px-4 lg:px-0">
            <SortableShots shots={shots} onChange={setShots} />
          </div>

          {/* Live Preview */}
          <div className="px-4 lg:px-0">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-pop">
            <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Live preview</p>
                <h2 className="truncate font-display text-2xl">{config.label}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Select value={exportSize} onValueChange={setExportSize}>
                  <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPORT_SIZES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger className="h-9 w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={onExport} className="h-9 bg-gradient-gold text-primary-foreground"><Download className="mr-1 h-4 w-4" />Export</Button>
              </div>
            </div>
            <div className="mx-auto max-w-md">
              <FilmStripPreview shots={shots} config={config} />
            </div>
          </div>
          </div>
        </div>

        {/* RIGHT: TEMPLATES + SETTINGS */}
        <aside className="mt-6 space-y-4 px-4 pb-6 lg:mt-0 lg:px-0 lg:pb-0">
          {/* Template picker */}
          <div className="rounded-3xl border border-gold/20 bg-card/80 p-4 shadow-pop backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/booth" className="rounded-full p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground -ml-1">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Classic Film Strips</p>
              </div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{FILM_STRIP_PRESETS.length} premium</span>
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
            <div className="hairline mb-3" />
            
            {FILM_STRIP_PRESETS.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {FILM_STRIP_PRESETS
                  .filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                  <TemplateCard
                    key={p.id}
                    config={p}
                    active={presetId === p.id}
                    onClick={() => applyPreset(p)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-4">No templates found.</p>
            )}

            {customTemplates.filter(t => t.config.label.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
              <>
                <p className="mt-5 mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  My templates ({customTemplates.filter(t => t.config.label.toLowerCase().includes(searchQuery.toLowerCase())).length})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {customTemplates
                    .filter(t => t.config.label.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice()
                    .sort((a, b) => (favorites.includes(b.key) ? 1 : 0) - (favorites.includes(a.key) ? 1 : 0))
                    .map((t) => (
                    <div key={t.key} className="relative">
                      <TemplateCard
                        config={t.config}
                        active={presetId === t.key}
                        onClick={() => applyCustom(t)}
                        badge={favorites.includes(t.key) ? <Star className="h-3 w-3 fill-gold text-gold" /> : null}
                      />
                      <div className="absolute right-1 top-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded-md bg-black/60 p-1 text-white" aria-label="Template actions">
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleFav(t.key)}>
                              {favorites.includes(t.key) ? <><StarOff className="mr-2 h-4 w-4" />Unfavorite</> : <><Star className="mr-2 h-4 w-4" />Favorite</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setRenamingKey(t.key); setRenameValue(t.config.label); }}>
                              <Pencil className="mr-2 h-4 w-4" />Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateCustom(t.key)}>
                              <Copy className="mr-2 h-4 w-4" />Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteCustom(t.key)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {renamingKey === t.key && (
                        <div className="absolute inset-x-1 bottom-1 flex gap-1 rounded-lg bg-background/95 p-1 shadow-pop">
                          <Input
                            autoFocus value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingKey(null); }}
                            className="h-7 text-xs"
                          />
                          <Button size="sm" className="h-7" onClick={commitRename}>OK</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4 flex gap-2">
              <Sheet onOpenChange={(o) => { editorOpenRef.current = o; }}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1"><Sparkles className="mr-2 h-4 w-4" />Customize</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Customize · {config.label}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FilmStripEditor config={config} onChange={setConfig} />
                  </div>
                </SheetContent>
              </Sheet>
              <Button onClick={saveCurrentAsTemplate}><Save className="mr-2 h-4 w-4" />Save</Button>
            </div>
          </div>

          {/* Capture settings */}
          <div className="rounded-3xl border border-border/60 bg-card p-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">Countdown</p>
            <div className="flex gap-2">
              {([0, 3, 5, 10] as CountdownOpt[]).map((n) => (
                <button key={n} onClick={() => setCountdown(n)}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium ${countdown === n ? "border-gold bg-gradient-gold text-primary-foreground" : "border-border bg-card"}`}>
                  {n === 0 ? "Off" : `${n}s`}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Label className="flex items-center gap-2"><Sun className="h-4 w-4" />Flash</Label>
              <Switch checked={flash} onCheckedChange={setFlash} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Label className="flex items-center gap-2">{sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}Sound & voice</Label>
              <Switch checked={sound} onCheckedChange={setSound} />
            </div>
            {shots.length > 0 && (
              <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => { setShots(shots.slice(0, -1)); }}>
                <RefreshCw className="mr-2 h-3 w-3" />Retake last
              </Button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}

function TemplateCard({ config, active, onClick, badge }: { config: FilmStripConfig; active: boolean; onClick: () => void; badge?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-2 text-left transition ${active ? "border-gold/70 shadow-glow" : "border-border/60 hover:border-gold/40"}`}
      style={{ background: config.bg }}
      title={config.label}
    >
      {badge && <div className="absolute left-2 top-2 z-10">{badge}</div>}
      {/* Mini strip preview */}
      <div className="flex gap-1" style={{ aspectRatio: "9/16" }}>
        {Array.from({ length: config.strips }).map((_, s) => (
          <div key={s} className="flex-1 rounded-md" style={{ background: config.filmColor }}>
            <div className="flex h-full flex-col gap-[3px] p-[6px]">
              {Array.from({ length: config.perStrip }).map((_, i) => (
                <div key={i} className="flex-1 rounded-[2px]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(0,0,0,0.35))" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-widest" style={{ color: config.brandingTextColor }}>
        <span className="truncate">{config.label}</span>
        <span className="opacity-60">{config.strips}×{config.perStrip}</span>
      </div>
    </button>
  );
}

// Suppress unused import when getFilmStripPreset isn't used elsewhere in this file
void getFilmStripPreset;
