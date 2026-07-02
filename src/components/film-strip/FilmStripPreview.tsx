import { useEffect, useRef } from "react";
import { renderFilmStripCanvas, type FilmStripConfig, DEFAULT_SIZE } from "@/lib/film-strip";

interface Props {
  shots: (HTMLCanvasElement | null)[];
  config: FilmStripConfig;
  className?: string;
}

export function FilmStripPreview({ shots, config, className }: Props) {
  const holderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!holderRef.current) return;
    const canvas = renderFilmStripCanvas(shots, config, DEFAULT_SIZE);
    // Fit into container by CSS
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    canvas.style.display = "block";
    canvas.style.borderRadius = "12px";
    holderRef.current.replaceChildren(canvas);
  }, [shots, config]);

  return <div ref={holderRef} className={className} aria-label={`Preview of ${config.label}`} />;
}
