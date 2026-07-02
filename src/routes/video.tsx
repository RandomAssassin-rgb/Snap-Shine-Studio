import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Video as VideoIcon, StopCircle, Download, RotateCcw, Save, Share2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { downloadBlob } from "@/lib/strip";
import { shareOrCopy } from "@/lib/share";

export const Route = createFileRoute("/video")({
  head: () => ({ meta: [
    { title: "Video booth — Snap & Shine Studio" },
    { name: "description", content: "Record short videos with your webcam, preview, and share." },
  ] }),
  component: VideoBoothPage,
});

const DURATIONS = [5, 10, 15, 30] as const;

function pickMime(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const t of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

function VideoBoothPage() {
  const { user } = useAuth();
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [ready, setReady] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [duration, setDuration] = useState<number>(10);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { void start(); return () => stopStream(); /* eslint-disable-next-line */ }, [micOn]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  async function start() {
    stopStream();
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: micOn,
      });
      streamRef.current = s;
      if (previewRef.current) {
        previewRef.current.srcObject = s;
        await previewRef.current.play().catch(() => {});
      }
      setReady(true);
    } catch (e) {
      setReady(false);
      toast.error(e instanceof Error ? e.message : "Camera unavailable");
    }
  }

  async function beginRecording() {
    if (!streamRef.current) return;
    setBlob(null); if (url) URL.revokeObjectURL(url); setUrl(null);
    // 3-2-1 countdown
    for (let n = 3; n >= 1; n--) {
      setCountdown(n);
      await new Promise((r) => setTimeout(r, 800));
    }
    setCountdown(null);

    const mime = pickMime();
    chunksRef.current = [];
    const rec = new MediaRecorder(streamRef.current, mime ? { mimeType: mime } : undefined);
    recorderRef.current = rec;
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      const b = new Blob(chunksRef.current, { type: mime || "video/webm" });
      setBlob(b);
      const u = URL.createObjectURL(b);
      setUrl(u);
      if (playbackRef.current) { playbackRef.current.src = u; }
    };
    rec.start(200);
    setRecording(true);
    setElapsed(0);
    const startedAt = Date.now();
    const tick = () => {
      const t = (Date.now() - startedAt) / 1000;
      setElapsed(t);
      if (t >= duration) { stopRecording(); return; }
      if (recorderRef.current?.state === "recording") requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function stopRecording() {
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    setRecording(false);
  }

  function reset() {
    setBlob(null); if (url) URL.revokeObjectURL(url); setUrl(null); setElapsed(0);
  }

  async function upload() {
    if (!blob) return;
    if (!user) { toast.info("Sign in to save your video."); return; }
    setUploading(true);
    try {
      const ext = (blob.type.includes("mp4") ? "mp4" : "webm");
      const path = `${user.id}/videos/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("photos").upload(path, blob, { upsert: true, contentType: blob.type });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
      await supabase.from("photos").insert({
        user_id: user.id, storage_path: path, public_url: pub.publicUrl,
        order_idx: 0, is_public: false, meta: { kind: "video", duration: elapsed },
      });
      toast.success("Saved to cloud.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function share() {
    if (!blob) return;
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const file = new File([blob], `Snap & Shine Studio.${ext}`, { type: blob.type });
    await shareOrCopy({ title: "Snap & Shine Studio video", text: "My video 🎥", url: window.location.origin, files: [file] });
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="mx-auto max-w-5xl gap-6 px-4 py-6 lg:grid lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-black shadow-pop aspect-video">
            <video ref={previewRef} autoPlay muted playsInline className={`h-full w-full object-cover ${blob ? "hidden" : ""}`} style={{ transform: "scaleX(-1)" }} />
            <video ref={playbackRef} playsInline controls className={`h-full w-full object-cover ${blob ? "" : "hidden"}`} />
            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[14rem] font-bold text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">{countdown}</span>
              </div>
            )}
            {recording && (
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> REC · {elapsed.toFixed(1)}s / {duration}s
              </div>
            )}
            {!ready && !blob && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                <p>Camera / mic access needed.</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!recording && !blob && (
              <Button size="lg" onClick={beginRecording} disabled={!ready} className="flex-1 min-w-[180px]">
                <VideoIcon className="mr-2 h-5 w-5" />Record {duration}s
              </Button>
            )}
            {recording && (
              <Button size="lg" variant="destructive" onClick={stopRecording} className="flex-1 min-w-[180px]">
                <StopCircle className="mr-2 h-5 w-5" />Stop
              </Button>
            )}
            {blob && (
              <>
                <Button size="lg" onClick={() => downloadBlob(blob, `Snap & Shine Studio-${Date.now()}.${blob.type.includes("mp4") ? "mp4" : "webm"}`)}><Download className="mr-2 h-4 w-4" />Download</Button>
                <Button size="lg" variant="secondary" onClick={upload} disabled={uploading}><Save className="mr-2 h-4 w-4" />{uploading ? "Uploading…" : "Save"}</Button>
                <Button size="lg" variant="outline" onClick={share}><Share2 className="mr-2 h-4 w-4" />Share</Button>
                <Button size="lg" variant="ghost" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Retake</Button>
              </>
            )}
          </div>
        </div>

        <aside className="mt-6 space-y-4 lg:mt-0">
          <div className="glass rounded-2xl p-4 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Duration</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`rounded-lg border py-2 text-sm font-medium ${duration === d ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
                    {d}s
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">{micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}Microphone</Label>
              <Switch checked={micOn} onCheckedChange={setMicOn} />
            </div>
            <p className="text-xs text-muted-foreground">
              Videos record in WebM (or MP4 on Safari). Sign in to save them to the cloud.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
