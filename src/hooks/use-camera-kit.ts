import { useEffect, useState, useRef } from "react";
import { initCameraKit, setCameraKitStream, getAvailableLenses, applyLens } from "@/lib/camera-kit";
import { Lens } from "@snap/camera-kit";

export function useCameraKit(stream: MediaStream | null) {
  const [isReady, setIsReady] = useState(false);
  const [lenses, setLenses] = useState<Lens[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeLensId, setActiveLensId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function setup() {
      if (!stream || !canvasRef.current) return;
      
      const session = await initCameraKit();
      if (!session || !mounted) return;

      await setCameraKitStream(stream, canvasRef.current);
      setLenses(getAvailableLenses());
      setIsReady(true);
    }

    setup();

    return () => {
      mounted = false;
      // We don't destroy the session completely on unmount so it's fast to reload,
      // but we could call pause() here if we want to save resources.
    };
  }, [stream]);

  const setLens = async (lensId: string | null) => {
    setActiveLensId(lensId);
    await applyLens(lensId || "");
  };

  return {
    isReady,
    lenses,
    canvasRef,
    activeLensId,
    setLens
  };
}
