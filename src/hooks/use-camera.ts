import { useCallback, useEffect, useRef, useState } from "react";
import { initCameraKit, setCameraKitStream, getAvailableLenses, applyLens, destroyCameraKitSession } from "@/lib/camera-kit";
import { Lens } from "@snap/camera-kit";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error" | "no-camera";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mirror, setMirror] = useState(true);

  // Camera Kit specific state
  const [arEnabled, setArEnabled] = useState(false);
  const [arLenses, setArLenses] = useState<Lens[]>([]);
  const [activeLensId, setActiveLensId] = useState<string | null>(null);
  const arCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach(t => t.stop());
      rawStreamRef.current = null;
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const cams = list
        .filter(d => d.kind === "videoinput")
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
      setDevices(cams);
      return cams;
    } catch {
      return [];
    }
  }, []);

  const start = useCallback(async (opts: { deviceId?: string | null; facingMode?: "user" | "environment" } = {}) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("no-camera");
      setError("Camera API not available in this browser.");
      return;
    }
    setStatus("requesting");
    setError(null);
    stop();
    const targetFacing = opts.facingMode ?? facingMode;
    const targetDevice = opts.deviceId ?? deviceId;
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: targetDevice
        ? { deviceId: { exact: targetDevice }, width: { ideal: 1920 }, height: { ideal: 1080 } }
        : { facingMode: { ideal: targetFacing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      rawStreamRef.current = stream;

      // Initialize AR Canvas if missing
      if (!arCanvasRef.current) {
        arCanvasRef.current = document.createElement("canvas");
      }

      // Try to boot Camera Kit
      const session = await initCameraKit();
      if (session && arCanvasRef.current) {
        setArEnabled(true);
        setArLenses(getAvailableLenses());
        
        // Pipe stream through Snap SDK
        await setCameraKitStream(stream, arCanvasRef.current);
        
        // Extract the processed AR stream and feed it to the UI
        const processedStream = arCanvasRef.current.captureStream(30);
        streamRef.current = processedStream;
      } else {
        // Fallback to raw stream if SDK fails
        streamRef.current = stream;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      if (settings.deviceId) setDeviceId(settings.deviceId);
      if (opts.facingMode) setFacingMode(opts.facingMode);
      await refreshDevices();
      setStatus("ready");
    } catch (e) {
      const err = e as DOMException;
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setStatus("denied");
        setError("Camera access was denied. Enable it in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
        setStatus("no-camera");
        setError("No camera found on this device.");
      } else {
        setStatus("error");
        setError(err.message || "Failed to open camera.");
      }
    }
  }, [deviceId, facingMode, refreshDevices, stop]);

  const switchCamera = useCallback(async () => {
    if (devices.length > 1) {
      const idx = devices.findIndex(d => d.deviceId === deviceId);
      const next = devices[(idx + 1) % devices.length];
      await start({ deviceId: next.deviceId });
    } else {
      const next = facingMode === "user" ? "environment" : "user";
      await start({ facingMode: next, deviceId: null });
    }
  }, [devices, deviceId, facingMode, start]);

  const setLens = useCallback(async (lensId: string | null) => {
    if (arEnabled) {
      setActiveLensId(lensId);
      await applyLens(lensId || "");
    }
  }, [arEnabled]);

  useEffect(() => {
    return () => {
      stop();
      destroyCameraKitSession();
    };
  }, [stop]);

  useEffect(() => {
    if (navigator.mediaDevices?.addEventListener) {
      const handler = () => refreshDevices();
      navigator.mediaDevices.addEventListener("devicechange", handler);
      return () => navigator.mediaDevices.removeEventListener("devicechange", handler);
    }
  }, [refreshDevices]);

  /** Capture a frame from the video stream into an offscreen canvas, applying a CSS filter string. */
  const capture = useCallback((filterCss: string, applyMirror: boolean = mirror): HTMLCanvasElement | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = filterCss && filterCss !== "none" ? filterCss : "none";
    if (applyMirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
  }, [mirror]);

  return {
    videoRef, devices, deviceId, facingMode, status, error,
    mirror, setMirror,
    start, stop, switchCamera, capture, refreshDevices,
    setDeviceId,
    arEnabled, arLenses, activeLensId, setLens
  };
}