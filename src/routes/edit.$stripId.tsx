import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download, Trash2, Type, Smile, Sparkles, Palette } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { downloadBlob, loadImage } from "@/lib/strip";
import { signedUrl } from "@/lib/storage";

export const Route = createFileRoute("/edit/$stripId")({
  head: () => ({ meta: [{ title: "Edit strip — Snap & Shine Studio" }] }),
  component: EditStripPage,
});

type Layer =
  | { id: string; kind: "text"; x: number; y: number; text: string; size: number; color: string; font: string }
  | { id: string; kind: "sticker"; x: number; y: number; emoji: string; size: number };

const STICKERS = ["❤️", "😍", "🥳", "🎉", "🌟", "✨", "🌈", "🌸", "🍓", "🎈", "🔥", "💯", "👑", "🦄", "🎂", "💖", "☀️", "🌙"];
const FRAMES = [
  { id: "none", label: "None" },
  { id: "polaroid", label: "Polaroid" },
  { id: "gold", label: "Gold" },
  { id: "confetti", label: "Confetti" },
  { id: "pastel", label: "Pastel" },
];

function EditStripPage() {
  const { stripId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [frame, setFrame] = useState<string>("none");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("strips").select("id,storage_path").eq("id", stripId).maybeSingle();
      if (error || !data) { toast.error("Strip not found"); navigate({ to: "/gallery" }); return; }
      const url = await signedUrl("strips", data.storage_path);
      if (!url) { toast.error("Could not access strip image"); return; }
      try { setBaseImg(await loadImage(url)); }
      catch { toast.error("Could not load strip image"); }
    })();
  }, [stripId, navigate]);

  useEffect(() => { render(); /* eslint-disable-next-line */ }, [baseImg, layers, frame, selected]);

  function render() {
    const c = canvasRef.current; if (!c || !baseImg) return;
    c.width = baseImg.naturalWidth; c.height = baseImg.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(baseImg, 0, 0);
    // Layers
    for (const l of layers) {
      if (l.kind === "text") {
        ctx.font = `700 ${l.size}px "${l.font}", Georgia, serif`;
        ctx.fillStyle = l.color;
        ctx.textBaseline = "top";
        ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 6;
        ctx.fillText(l.text, l.x, l.y);
        ctx.shadowBlur = 0;
      } else {
        ctx.font = `${l.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText(l.emoji, l.x, l.y);
      }
      if (l.id === selected) {
        const w = measureLayer(ctx, l);
        ctx.strokeStyle = "#f582ae"; ctx.lineWidth = 4; ctx.setLineDash([12, 8]);
        ctx.strokeRect(l.x - 4, l.y - 4, w.w + 8, w.h + 8);
        ctx.setLineDash([]);
      }
    }
    // Frame overlays
    drawFrame(ctx, frame, c.width, c.height);
  }

  function measureLayer(ctx: CanvasRenderingContext2D, l: Layer) {
    if (l.kind === "text") {
      ctx.font = `700 ${l.size}px "${l.font}", Georgia, serif`;
      return { w: ctx.measureText(l.text).width, h: l.size };
    }
    ctx.font = `${l.size}px "Apple Color Emoji", sans-serif`;
    return { w: ctx.measureText(l.emoji).width, h: l.size };
  }

  function toCanvasCoords(e: React.MouseEvent | React.TouchEvent) {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const sx = c.width / rect.width, sy = c.height / rect.height;
    return { x: (p.clientX - rect.left) * sx, y: (p.clientY - rect.top) * sy };
  }

  function hitTest(x: number, y: number): string | null {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    for (let i = layers.length - 1; i >= 0; i--) {
      const l = layers[i]; const m = measureLayer(ctx, l);
      if (x >= l.x - 8 && x <= l.x + m.w + 8 && y >= l.y - 8 && y <= l.y + m.h + 8) return l.id;
    }
    return null;
  }

  const addText = () => {
    const id = crypto.randomUUID();
    const c = canvasRef.current!;
    setLayers((prev) => [...prev, { id, kind: "text", x: c.width * 0.15, y: c.height * 0.85, text: "Best day ever!", size: Math.round(c.width * 0.06), color: "#001858", font: "Fraunces" }]);
    setSelected(id);
  };
  const addSticker = (emoji: string) => {
    const id = crypto.randomUUID();
    const c = canvasRef.current!;
    setLayers((prev) => [...prev, { id, kind: "sticker", x: c.width * 0.4, y: c.height * 0.4, emoji, size: Math.round(c.width * 0.15) }]);
    setSelected(id);
  };

  const updateSelected = (patch: Partial<Layer>) => {
    setLayers((prev) => prev.map((l) => l.id === selected ? { ...l, ...patch } as Layer : l));
  };

  const del = () => {
    setLayers((prev) => prev.filter((l) => l.id !== selected));
    setSelected(null);
  };

  async function save() {
    const c = canvasRef.current; if (!c) return;
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => b ? res(b) : rej(new Error("blob")), "image/jpeg", 0.92));
    downloadBlob(blob, `Snap & Shine Studio-edited-${Date.now()}.jpg`);
  }

  async function saveToCloud() {
    if (!user) return toast.info("Sign in to save.");
    const c = canvasRef.current; if (!c) return;
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => b ? res(b) : rej(new Error("blob")), "image/jpeg", 0.92));
    const path = `${user.id}/edited/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("strips").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("strips").getPublicUrl(path);
    await supabase.from("strips").insert({ user_id: user.id, storage_path: path, public_url: pub.publicUrl, template: "edited" });
    toast.success("Saved as new strip.");
    navigate({ to: "/gallery" });
  }

  const selectedLayer = layers.find((l) => l.id === selected);

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-6xl gap-4 px-4 py-6 lg:grid lg:grid-cols-[1fr_340px]">
        <div className="glass rounded-2xl p-3">
          <canvas
            ref={canvasRef}
            className="mx-auto block max-h-[75vh] w-auto cursor-move rounded-lg touch-none"
            onMouseDown={(e) => {
              const { x, y } = toCanvasCoords(e);
              const id = hitTest(x, y); setSelected(id);
              if (id) { const l = layers.find(l => l.id === id)!; dragRef.current = { id, dx: x - l.x, dy: y - l.y }; }
            }}
            onMouseMove={(e) => {
              if (!dragRef.current) return;
              const { x, y } = toCanvasCoords(e); const d = dragRef.current;
              setLayers((prev) => prev.map((l) => l.id === d.id ? { ...l, x: x - d.dx, y: y - d.dy } as Layer : l));
            }}
            onMouseUp={() => { dragRef.current = null; }}
            onMouseLeave={() => { dragRef.current = null; }}
            onTouchStart={(e) => {
              const { x, y } = toCanvasCoords(e); const id = hitTest(x, y); setSelected(id);
              if (id) { const l = layers.find(l => l.id === id)!; dragRef.current = { id, dx: x - l.x, dy: y - l.y }; }
            }}
            onTouchMove={(e) => {
              if (!dragRef.current) return; e.preventDefault();
              const { x, y } = toCanvasCoords(e); const d = dragRef.current;
              setLayers((prev) => prev.map((l) => l.id === d.id ? { ...l, x: x - d.dx, y: y - d.dy } as Layer : l));
            }}
            onTouchEnd={() => { dragRef.current = null; }}
          />
          {!baseImg && <p className="p-8 text-center text-muted-foreground">Loading strip…</p>}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button onClick={save}><Download className="mr-1 h-4 w-4" />Download</Button>
            <Button variant="secondary" onClick={saveToCloud}>Save as new strip</Button>
          </div>
        </div>

        <aside className="mt-4 space-y-3 lg:mt-0">
          <div className="glass rounded-2xl p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground"><Smile className="h-4 w-4" />Stickers</p>
            <div className="grid grid-cols-6 gap-1">
              {STICKERS.map((e) => <button key={e} onClick={() => addSticker(e)} className="rounded-lg bg-card p-2 text-2xl hover:bg-secondary">{e}</button>)}
            </div>
          </div>

          <div className="glass rounded-2xl p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground"><Type className="h-4 w-4" />Text</p>
            <Button variant="secondary" size="sm" onClick={addText}>Add text layer</Button>
            {selectedLayer?.kind === "text" && (
              <div className="mt-3 space-y-2">
                <div>
                  <Label className="text-xs">Content</Label>
                  <Input value={selectedLayer.text} onChange={(e) => updateSelected({ text: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Color</Label>
                  <input type="color" value={selectedLayer.color} onChange={(e) => updateSelected({ color: e.target.value })} className="h-10 w-full rounded" />
                </div>
                <div>
                  <Label className="text-xs">Font</Label>
                  <select value={selectedLayer.font} onChange={(e) => updateSelected({ font: e.target.value })} className="w-full rounded border bg-card px-2 py-1 text-sm">
                    <option value="Fraunces">Fraunces (serif)</option>
                    <option value="Plus Jakarta Sans">Jakarta Sans</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Impact">Impact</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Size</Label>
                  <Slider min={20} max={200} step={2} value={[selectedLayer.size]} onValueChange={([v]) => updateSelected({ size: v })} />
                </div>
              </div>
            )}
            {selectedLayer?.kind === "sticker" && (
              <div className="mt-3 space-y-2">
                <Label className="text-xs">Size</Label>
                <Slider min={30} max={400} step={5} value={[selectedLayer.size]} onValueChange={([v]) => updateSelected({ size: v })} />
              </div>
            )}
            {selectedLayer && (
              <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={del}><Trash2 className="mr-1 h-4 w-4" />Delete layer</Button>
            )}
          </div>

          <div className="glass rounded-2xl p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground"><Palette className="h-4 w-4" />Frame</p>
            <div className="grid grid-cols-3 gap-1">
              {FRAMES.map((f) => (
                <button key={f.id} onClick={() => setFrame(f.id)}
                  className={`rounded-lg border py-2 text-xs font-medium ${frame === f.id ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1"><Sparkles className="h-3 w-3" />Tap a layer to select and drag it. Everything renders to a downloadable image.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function drawFrame(ctx: CanvasRenderingContext2D, id: string, w: number, h: number) {
  if (id === "none") return;
  ctx.save();
  if (id === "polaroid") {
    ctx.lineWidth = Math.max(24, w * 0.03);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  } else if (id === "gold") {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#f6d365"); g.addColorStop(1, "#fda085");
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(20, w * 0.025);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
  } else if (id === "confetti") {
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = ["#f582ae", "#8bd3dd", "#fef6e4", "#f3d2c1"][i % 4];
      const x = Math.random() * w, y = Math.random() * h, r = 6 + Math.random() * 10;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === "pastel") {
    ctx.strokeStyle = "#f582ae"; ctx.lineWidth = Math.max(16, w * 0.02);
    ctx.setLineDash([24, 16]);
    ctx.strokeRect(ctx.lineWidth, ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  }
  ctx.restore();
}
