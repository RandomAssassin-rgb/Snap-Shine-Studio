import { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { loadedAssets, preloadARAssets } from "@/lib/ar-assets";

export const CUSTOM_AR_LENSES = [
  { id: "puppy_camera", name: "Puppy Camera", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ccc'/><circle cx='50' cy='50' r='20' fill='black'/></svg>" },
  { id: "bw_glasses", name: "BW Glasses", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='10' y='35' width='80' height='30' fill='black'/></svg>" },
  { id: "cupids_crown", name: "Cupid's Crown", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ffb3c6'/></svg>" },
  { id: "dog_polka_nerd", name: "Dog Polka Nerd", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ffb3c6'/></svg>" },
  { id: "heart_peace", name: "Heart Peace", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23ffb3c6'/></svg>" },
  { id: "melon_bear", name: "Melon Bear", iconUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238c5a2b'/></svg>" },
];

export function isCustomARLens(id: string | null) {
  return CUSTOM_AR_LENSES.some(l => l.id === id);
}

export function useCustomAR(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  activeLensId: string | null
) {
  const [isReady, setIsReady] = useState(false);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize MediaPipe and Preload Assets
  useEffect(() => {
    let mounted = true;

    async function init() {
      await preloadARAssets();
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      if (mounted) {
        landmarkerRef.current = landmarker;
        setIsReady(true);
      }
    }

    init();

    return () => {
      mounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  // Rendering Loop
  useEffect(() => {
    if (!isReady || !activeLensId || !isCustomARLens(activeLensId)) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      // Clear canvas if AR is turned off
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !landmarkerRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function renderLoop() {
      if (video!.readyState >= 2) {
        const startTimeMs = performance.now();
        if (lastVideoTimeRef.current !== video!.currentTime) {
          lastVideoTimeRef.current = video!.currentTime;
          
          // Match canvas size to video size
          if (canvas!.width !== video!.videoWidth) {
            canvas!.width = video!.videoWidth;
            canvas!.height = video!.videoHeight;
          }

          const results = landmarkerRef.current!.detectForVideo(video!, startTimeMs);
          
          ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
          
          if (results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const w = canvas!.width;
            const h = canvas!.height;

            // Draw based on the active custom lens
            drawLens(ctx!, landmarks, w, h, activeLensId!);
          }
        }
      }
      requestRef.current = requestAnimationFrame(renderLoop);
    }

    requestRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isReady, activeLensId, videoRef, canvasRef]);
}

function drawLens(ctx: CanvasRenderingContext2D, landmarks: any[], w: number, h: number, lensId: string) {
  // Landmarks indices: 
  // 33: left eye outer, 133: left eye inner
  // 362: right eye inner, 263: right eye outer
  // 1: nose tip
  // 10: top of head (hairline)
  // 234: left ear/cheek edge, 454: right ear/cheek edge

  const drawImage = (imgName: string, cx: number, cy: number, width: number, angle: number) => {
    const img = loadedAssets[imgName];
    if (!img) return;
    const ratio = img.height / img.width;
    const height = width * ratio;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  };

  const getPoint = (idx: number) => ({ x: landmarks[idx].x * w, y: landmarks[idx].y * h });
  
  const nose = getPoint(1);
  const leftEye = getPoint(33);
  const rightEye = getPoint(263);
  const headTop = getPoint(10);
  const faceLeft = getPoint(234);
  const faceRight = getPoint(454);

  const faceWidth = Math.hypot(faceRight.x - faceLeft.x, faceRight.y - faceLeft.y);
  const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
  const midEyeX = (leftEye.x + rightEye.x) / 2;
  const midEyeY = (leftEye.y + rightEye.y) / 2;

  if (lensId === "bw_glasses") {
    // Thug life Pixel glasses
    const glassesWidth = faceWidth * 1.1;
    drawImage("pixelGlasses", midEyeX, midEyeY, glassesWidth, eyeAngle);
  }

  if (lensId === "dog_polka_nerd") {
    // Nerd glasses (thick black rims)
    const glassesWidth = faceWidth * 1.15;
    drawImage("nerdGlasses", midEyeX, midEyeY, glassesWidth, eyeAngle);
  }

  if (lensId === "puppy_camera" || lensId === "dog_polka_nerd") {
    // Dog ears
    const earWidth = faceWidth * 0.45;
    drawImage("dogEarLeft", faceLeft.x + earWidth*0.2, headTop.y - earWidth*0.4, earWidth, eyeAngle - 0.2);
    drawImage("dogEarRight", faceRight.x - earWidth*0.2, headTop.y - earWidth*0.4, earWidth, eyeAngle + 0.2);
    // Dog nose
    drawImage("dogNose", nose.x, nose.y, faceWidth * 0.28, eyeAngle);
  }

  if (lensId === "cupids_crown" || lensId === "heart_peace") {
    // Floating hearts (draw 7 hearts in an arc)
    const crownWidth = faceWidth * 1.2;
    const r = crownWidth * 0.6; // radius of the arc
    for (let i = 0; i < 7; i++) {
      const theta = Math.PI + (Math.PI * (i / 6)); // From PI to 2PI (top half circle)
      // Widen the arc slightly horizontally
      const hx = headTop.x + Math.cos(theta + eyeAngle) * (r * 1.1);
      const hy = headTop.y + Math.sin(theta + eyeAngle) * (r * 0.8) + (r * 0.3); // drop it slightly closer to head
      // Alternate heart sizes slightly
      const size = crownWidth * (i % 2 === 0 ? 0.25 : 0.18);
      // Alternate slight rotation
      const rot = eyeAngle + (i % 2 === 0 ? 0.2 : -0.2);
      drawImage("heart", hx, hy, size, rot);
    }
  }

  if (lensId === "heart_peace") {
    // Bows
    const bowWidth = faceWidth * 0.4;
    drawImage("pinkBow", faceLeft.x, headTop.y, bowWidth, eyeAngle - 0.5);
    drawImage("pinkBow", faceRight.x, headTop.y, bowWidth, eyeAngle + 0.5);
  }

  if (lensId === "melon_bear") {
    // Bear ears
    const earWidth = faceWidth * 0.4;
    drawImage("bearEarLeft", faceLeft.x, headTop.y - earWidth/3, earWidth, eyeAngle);
    drawImage("bearEarRight", faceRight.x, headTop.y - earWidth/3, earWidth, eyeAngle);
    // Bear nose
    drawImage("bearNose", nose.x, nose.y + faceWidth*0.05, faceWidth * 0.4, eyeAngle);
  }
}
