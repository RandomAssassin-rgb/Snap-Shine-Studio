// Canvas renderer for the Classic Film Strips collection.
// Additive: does not touch existing renderStrip/layouts.

export interface FilmStripConfig {
  id: string;
  label: string;
  // Layout
  perStrip: number;              // photos per strip (2..6)
  strips: 1 | 2;                 // # of vertical strips
  bg: string;                    // canvas background
  filmColor: string;             // strip base color (usually black)
  sprocketColor: string;         // holes color (usually white/bg)
  cellBg?: string;               // photo cell background if no image
  borderThickness: number;       // px @ base 1080 width
  cornerRadius: number;          // px @ base
  shadow: boolean;
  innerSpacing: number;          // gap between cells within a strip
  outerMargin: number;           // canvas edge margin
  stripSpacing: number;          // gap between strips
  gutter: number;                // side gutter inside the film where sprockets sit
  sprocketSize: number;          // px @ base
  sprocketGap: number;           // px @ base
  sprocketRadius: number;
  // Photo cell
  photoRadius: number;
  // Branding band
  brandingHeight: number;        // px @ base
  brandingBg?: string;
  brandingTextColor: string;
  brandingAccent?: string;
  eventName?: string;
  showEventName: boolean;
  showDate: boolean;
  dateFormat: "iso" | "long" | "short";
  showLogo: boolean;
  logoText?: string;             // when no image logo
  logoDataUrl?: string;
  showQr: boolean;
  qrDataUrl?: string;            // pre-rendered QR (dataUrl)
  brandingPosition: "top" | "bottom" | "hidden";
  // Fonts
  fontFamily: string;            // css font stack
  labelUppercase: boolean;
}

// Reference width the config numbers are authored for.
const BASE_WIDTH = 1080;

export function totalShots(cfg: FilmStripConfig): number {
  return cfg.perStrip * cfg.strips;
}

function fmtDate(fmt: FilmStripConfig["dateFormat"], d = new Date()) {
  if (fmt === "iso") return d.toISOString().slice(0, 10);
  if (fmt === "short") return d.toLocaleDateString();
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y,     x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x,     y + h, rr);
  ctx.arcTo(x,     y + h, x,     y,     rr);
  ctx.arcTo(x,     y,     x + w, y,     rr);
  ctx.closePath();
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource & { width?: number; height?: number },
  x: number, y: number, w: number, h: number, radius: number,
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

export interface RenderSize { width: number; height: number }

export const DEFAULT_SIZE: RenderSize = { width: 1080, height: 1920 };

/**
 * Render the film strip to a canvas. `shots` may be shorter than totalShots(cfg) —
 * missing cells render as blank cellBg placeholders. This lets the editor show
 * a live preview before any photos exist.
 */
export function renderFilmStripCanvas(
  shots: (HTMLCanvasElement | HTMLImageElement | null)[],
  cfg: FilmStripConfig,
  size: RenderSize = DEFAULT_SIZE,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d")!;
  const S = size.width / BASE_WIDTH; // uniform scale

  // Background
  ctx.fillStyle = cfg.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const outerMargin = cfg.outerMargin * S;
  const stripSpacing = cfg.stripSpacing * S;
  const brandingH = cfg.brandingPosition === "hidden" ? 0 : cfg.brandingHeight * S;
  const brandingAtTop = cfg.brandingPosition === "top";

  const stripsAreaTop = outerMargin + (brandingAtTop ? brandingH + outerMargin * 0.4 : 0);
  const stripsAreaBottom = size.height - outerMargin - (brandingAtTop ? 0 : brandingH + outerMargin * 0.4);
  const stripsAreaLeft = outerMargin;
  const stripsAreaRight = size.width - outerMargin;
  const stripsAreaW = stripsAreaRight - stripsAreaLeft;
  const stripsAreaH = stripsAreaBottom - stripsAreaTop;

  const stripW = (stripsAreaW - stripSpacing * (cfg.strips - 1)) / cfg.strips;
  const stripH = stripsAreaH;

  const border = cfg.borderThickness * S;
  const gutter = cfg.gutter * S;                 // where sprocket holes sit
  const cornerR = cfg.cornerRadius * S;
  const innerSpacing = cfg.innerSpacing * S;
  const photoR = cfg.photoRadius * S;
  const sprocketW = cfg.sprocketSize * S;
  const sprocketH = cfg.sprocketSize * 0.7 * S;
  const sprocketGap = cfg.sprocketGap * S;
  const sprocketR = cfg.sprocketRadius * S;

  for (let s = 0; s < cfg.strips; s++) {
    const sx = stripsAreaLeft + s * (stripW + stripSpacing);
    const sy = stripsAreaTop;

    // Optional shadow behind the film
    if (cfg.shadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = 24 * S;
      ctx.shadowOffsetY = 10 * S;
      ctx.fillStyle = cfg.filmColor;
      roundRect(ctx, sx, sy, stripW, stripH, cornerR);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = cfg.filmColor;
      roundRect(ctx, sx, sy, stripW, stripH, cornerR);
      ctx.fill();
    }

    // Sprocket holes along both gutters
    ctx.fillStyle = cfg.sprocketColor;
    const holeStrideY = sprocketH + sprocketGap;
    const holesCount = Math.max(4, Math.floor((stripH - gutter) / holeStrideY));
    const totalHolesH = holesCount * sprocketH + (holesCount - 1) * sprocketGap;
    const holesStartY = sy + (stripH - totalHolesH) / 2;
    const leftHoleX = sx + (gutter - sprocketW) / 2;
    const rightHoleX = sx + stripW - gutter + (gutter - sprocketW) / 2;
    for (let i = 0; i < holesCount; i++) {
      const hy = holesStartY + i * holeStrideY;
      roundRect(ctx, leftHoleX, hy, sprocketW, sprocketH, sprocketR);
      ctx.fill();
      roundRect(ctx, rightHoleX, hy, sprocketW, sprocketH, sprocketR);
      ctx.fill();
    }

    // Photo cells
    const cellsLeft = sx + gutter + border;
    const cellsRight = sx + stripW - gutter - border;
    const cellsTop = sy + border * 1.2;
    const cellsBottom = sy + stripH - border * 1.2;
    const cellsW = cellsRight - cellsLeft;
    const cellsH = cellsBottom - cellsTop;
    const cellH = (cellsH - innerSpacing * (cfg.perStrip - 1)) / cfg.perStrip;

    for (let i = 0; i < cfg.perStrip; i++) {
      const cy = cellsTop + i * (cellH + innerSpacing);
      const globalIdx = s * cfg.perStrip + i;
      const src = shots[globalIdx];
      // Cell backdrop
      ctx.fillStyle = cfg.cellBg ?? "#1a1a1a";
      roundRect(ctx, cellsLeft, cy, cellsW, cellH, photoR);
      ctx.fill();
      if (src) drawCover(ctx, src, cellsLeft, cy, cellsW, cellH, photoR);
    }
  }

  // Branding band
  if (cfg.brandingPosition !== "hidden") {
    const by = brandingAtTop ? outerMargin : size.height - outerMargin - brandingH;
    const bx = outerMargin;
    const bw = size.width - outerMargin * 2;
    if (cfg.brandingBg) {
      ctx.fillStyle = cfg.brandingBg;
      roundRect(ctx, bx, by, bw, brandingH, 18 * S);
      ctx.fill();
    }
    if (cfg.brandingAccent) {
      ctx.fillStyle = cfg.brandingAccent;
      ctx.fillRect(bx, brandingAtTop ? by + brandingH - 3 * S : by, bw, 3 * S);
    }

    const cx = size.width / 2;
    const cy = by + brandingH / 2;

    // QR (left)
    let leftEdge = bx + 24 * S;
    if (cfg.showQr && cfg.qrDataUrl) {
      const qrSize = brandingH - 24 * S;
      const img = new Image();
      img.src = cfg.qrDataUrl;
      try {
        if (img.complete && img.naturalWidth) {
          ctx.drawImage(img, leftEdge, cy - qrSize / 2, qrSize, qrSize);
          leftEdge += qrSize + 20 * S;
        }
      } catch { /* ignore */ }
    }

    // Logo (right)
    let rightEdge = bx + bw - 24 * S;
    if (cfg.showLogo) {
      if (cfg.logoDataUrl) {
        const img = new Image();
        img.src = cfg.logoDataUrl;
        if (img.complete && img.naturalWidth) {
          const lh = brandingH - 32 * S;
          const lw = (img.naturalWidth / img.naturalHeight) * lh;
          ctx.drawImage(img, rightEdge - lw, cy - lh / 2, lw, lh);
          rightEdge -= lw + 20 * S;
        }
      } else if (cfg.logoText) {
        ctx.fillStyle = cfg.brandingTextColor;
        ctx.font = `600 ${28 * S}px ${cfg.fontFamily}`;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        const text = cfg.labelUppercase ? cfg.logoText.toUpperCase() : cfg.logoText;
        ctx.fillText(text, rightEdge, cy);
        rightEdge -= ctx.measureText(text).width + 20 * S;
      }
    }

    // Event name / date (centered between leftEdge and rightEdge)
    ctx.fillStyle = cfg.brandingTextColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines: string[] = [];
    if (cfg.showEventName && cfg.eventName) {
      lines.push(cfg.labelUppercase ? cfg.eventName.toUpperCase() : cfg.eventName);
    }
    if (cfg.showDate) lines.push(fmtDate(cfg.dateFormat));

    if (lines.length === 1) {
      ctx.font = `500 ${34 * S}px ${cfg.fontFamily}`;
      ctx.fillText(lines[0], cx, cy);
    } else if (lines.length === 2) {
      ctx.font = `600 ${34 * S}px ${cfg.fontFamily}`;
      ctx.fillText(lines[0], cx, cy - 20 * S);
      ctx.font = `400 ${22 * S}px ${cfg.fontFamily}`;
      ctx.fillText(lines[1], cx, cy + 20 * S);
    }
  }

  return canvas;
}

export async function renderFilmStrip(
  shots: HTMLCanvasElement[],
  cfg: FilmStripConfig,
  size: RenderSize = DEFAULT_SIZE,
  opts: { format?: "image/png" | "image/jpeg"; quality?: number } = {},
): Promise<{ blob: Blob; dataUrl: string; canvas: HTMLCanvasElement }> {
  const canvas = renderFilmStripCanvas(shots, cfg, size);
  const format = opts.format ?? "image/jpeg";
  const quality = opts.quality ?? 0.94;
  const blob = await new Promise<Blob>((res, rej) => {
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), format, quality);
  });
  const dataUrl = canvas.toDataURL(format, quality);
  return { blob, dataUrl, canvas };
}
