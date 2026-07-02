import type { LayoutDef } from "./layouts";

// Compose captured shots into a single strip/canvas. Returns Blob (image/jpeg).
export async function renderStrip(
  images: HTMLImageElement[] | HTMLCanvasElement[],
  layout: LayoutDef,
  opts: { format?: "image/png" | "image/jpeg" | "image/webp"; quality?: number } = {}
): Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }> {
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = layout.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cell math
  const pad = layout.padding;
  const gap = layout.gap;
  const labelH = layout.labelText ? 96 : 0;
  const usableW = canvas.width - pad * 2;
  const usableH = canvas.height - pad * 2 - labelH;
  const cellW = (usableW - gap * (layout.cols - 1)) / layout.cols;
  const cellH = (usableH - gap * (layout.rows - 1)) / layout.rows;

  // Optional accent bar (top)
  if (layout.accent) {
    ctx.fillStyle = layout.accent;
    ctx.fillRect(0, 0, canvas.width, 12);
  }

  for (let i = 0; i < layout.shots && i < images.length; i++) {
    const r = Math.floor(i / layout.cols);
    const c = i % layout.cols;
    const x = pad + c * (cellW + gap);
    const y = pad + r * (cellH + gap);
    drawCovered(ctx, images[i], x, y, cellW, cellH, 12);
  }

  // Label / footer
  if (layout.labelText) {
    const y = canvas.height - pad - labelH + labelH / 2;
    ctx.fillStyle = layout.labelColor ?? "#001858";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 40px "Fraunces", Georgia, serif`;
    const text = (layout.emoji ? layout.emoji + "  " : "") + layout.labelText;
    ctx.fillText(text, canvas.width / 2, y);
    ctx.font = `500 20px "Plus Jakarta Sans", system-ui, sans-serif`;
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, y + 40);
  }

  const format = opts.format ?? "image/jpeg";
  const quality = opts.quality ?? 0.92;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), format, quality);
  });
  const dataUrl = canvas.toDataURL(format, quality);
  return { blob, dataUrl, canvas };
}

function drawCovered(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource & { width?: number; height?: number },
  x: number, y: number, w: number, h: number, radius = 12
) {
  const sw = (src as HTMLImageElement).naturalWidth || (src as HTMLCanvasElement).width;
  const sh = (src as HTMLImageElement).naturalHeight || (src as HTMLCanvasElement).height;
  if (!sw || !sh) return;
  const srcRatio = sw / sh;
  const dstRatio = w / h;
  let sx = 0, sy = 0, sWidth = sw, sHeight = sh;
  if (srcRatio > dstRatio) {
    sWidth = sh * dstRatio;
    sx = (sw - sWidth) / 2;
  } else {
    sHeight = sw / dstRatio;
    sy = (sh - sHeight) / 2;
  }
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(src, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Load an image URL into an HTMLImageElement
export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}