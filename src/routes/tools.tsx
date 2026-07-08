import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Sparkles, Upload, Download, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/strip";
import { editImage } from "@/lib/ai-tools.functions";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [
    { title: "AI tools — SnapBooth" },
    { name: "description", content: "AI background removal, run entirely in your browser." },
  ] }),
  component: ToolsPage,
});

function ToolsPage() {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const runEdit = useServerFn(editImage);

  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    setPendingFile(file);
    setSrcUrl(URL.createObjectURL(file));
    setOutUrl(null); setOutBlob(null);
  };

  const run = async (prompt: string) => {
    if (!pendingFile) { toast.error("Upload an image first."); return; }
    setBusy(true); setProgress("Sending to AI…");
    try {
      const dataUrl = await fileToDataUrl(pendingFile);
      setProgress("AI is editing your photo…");
      const { dataUrl: outDataUrl } = await runEdit({ data: { dataUrl, prompt } });
      const blob = await (await fetch(outDataUrl)).blob();
      const finalBlob = bgColor !== "transparent" && prompt.toLowerCase().includes("remove")
        ? await recolor(blob, bgColor)
        : blob;
      setOutBlob(finalBlob);
      setOutUrl(URL.createObjectURL(finalBlob));
      toast.success("Done!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setBusy(false); setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="font-display text-4xl">AI tools</h1>
        <p className="mt-1 text-muted-foreground">Edit your photos with AI — background removal, retouch, and creative prompts.</p>

        <section className="glass mt-6 rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Photo editor</h2>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
            <Button onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="mr-2 h-4 w-4" />Upload image
            </Button>
            <select value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
              <option value="transparent">Transparent PNG</option>
              <option value="#ffffff">White background</option>
              <option value="#000000">Black background</option>
              <option value="#fef6e4">Cream background</option>
              <option value="#a3d5ff">Sky blue</option>
              <option value="#f6c6ea">Pastel pink</option>
            </select>
            {busy && <span className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{progress}</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="secondary" disabled={busy || !pendingFile}
              onClick={() => void run("Remove the background from this photo. Keep the subject sharp and output a clean PNG with a transparent background.")}
            >
              <Sparkles className="mr-2 h-4 w-4" />Remove background
            </Button>
            <Button variant="secondary" disabled={busy || !pendingFile}
              onClick={() => void run("Retouch this portrait: gently smooth skin, brighten eyes, whiten teeth, and balance colors. Keep it natural and photorealistic.")}
            >
              <Wand2 className="mr-2 h-4 w-4" />Beauty retouch
            </Button>
            <Button variant="secondary" disabled={busy || !pendingFile}
              onClick={() => void run("Upscale and enhance this image: sharpen details, reduce noise, and improve overall clarity.")}
            >
              <Sparkles className="mr-2 h-4 w-4" />Enhance
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Custom prompt (e.g. 'add a party hat and confetti')"
              className="flex-1 min-w-[240px] rounded-lg border bg-card px-3 py-2 text-sm"
            />
            <Button disabled={busy || !pendingFile || !customPrompt.trim()} onClick={() => void run(customPrompt.trim())}>
              <Wand2 className="mr-2 h-4 w-4" />Run
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-3">
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Original</p>
              {srcUrl ? <img src={srcUrl} alt="Original" className="mx-auto max-h-96 rounded-lg" />
                : <div className="grid h-48 place-items-center text-sm text-muted-foreground">Upload an image to start.</div>}
            </div>
            <div className="rounded-xl border bg-card p-3" style={outUrl && bgColor === "transparent" ? { backgroundImage: "linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px" } : undefined}>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Result</p>
              {outUrl ? (
                <>
                  <img src={outUrl} alt="Result" className="mx-auto max-h-96 rounded-lg" />
                  <div className="mt-2 text-center">
                    <Button size="sm" onClick={() => outBlob && downloadBlob(outBlob, `snapbooth-ai-${Date.now()}.png`)}>
                      <Download className="mr-1 h-4 w-4" />Download PNG
                    </Button>
                  </div>
                </>
              ) : <div className="grid h-48 place-items-center text-sm text-muted-foreground">Result appears here.</div>}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Powered by Lovable AI. Each edit uses workspace credits.</p>
        </section>
      </main>
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

async function recolor(pngBlob: Blob, color: string): Promise<Blob> {
  const bmp = await createImageBitmap(pngBlob);
  const c = document.createElement("canvas");
  c.width = bmp.width; c.height = bmp.height;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0);
  return new Promise<Blob>((res, rej) => c.toBlob((b) => b ? res(b) : rej(new Error("toBlob failed")), "image/png"));
}