import { jsPDF } from "jspdf";
import { renderFilmStripCanvas, type FilmStripConfig, type RenderSize } from "./film-strip";

export type ExportFormat = "png" | "jpg" | "pdf";

export const EXPORT_SIZES: { id: string; label: string; size: RenderSize; dpi?: number }[] = [
  { id: "1080x1920", label: "1080 × 1920 (social)", size: { width: 1080, height: 1920 } },
  { id: "2048x4096", label: "2048 × 4096 (hi-res)", size: { width: 2048, height: 4096 } },
  { id: "print-300", label: "4×6 in @ 300 DPI (print)", size: { width: 1200, height: 1800 }, dpi: 300 },
];

export async function exportFilmStrip(
  shots: HTMLCanvasElement[],
  cfg: FilmStripConfig,
  size: RenderSize,
  format: ExportFormat,
): Promise<{ blob: Blob; filename: string }> {
  const canvas = renderFilmStripCanvas(shots, cfg, size);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const base = `filmstrip-${cfg.id}-${stamp}`;

  if (format === "png") {
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/png"),
    );
    return { blob, filename: `${base}.png` };
  }
  if (format === "jpg") {
    const blob = await new Promise<Blob>((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob"))), "image/jpeg", 0.95),
    );
    return { blob, filename: `${base}.jpg` };
  }
  // PDF
  const orientation = size.width > size.height ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [size.width, size.height], compress: true });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(dataUrl, "JPEG", 0, 0, size.width, size.height, undefined, "FAST");
  const blob = pdf.output("blob");
  return { blob, filename: `${base}.pdf` };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
