// Live filter presets applied via CSS `filter` string.
// Applied identically to the <video> preview and to the capture canvas so
// what you see is what you get.

export type FilterId =
  | "normal" | "bw" | "sepia" | "vintage" | "warm" | "cool"
  | "film" | "kodak" | "fuji" | "neon" | "cyberpunk" | "dream"
  | "soft" | "pastel" | "hdr" | "highcontrast" | "lowcontrast"
  | "bright" | "dark" | "sharpen" | "noir" | "glow" | "vhs"
  | "retro" | "invert" | "cold" | "candy" | "sunset" | "mono"
  | "clarity" | "matte"
  // Snapchat-inspired filters
  | "twilight" | "bw-glasses" | "cupid" | "polka-nerd" | "pookie"
  | "blurish" | "retro-heart" | "gray-flash" | "mystic-glow"
  | "bear-bear" | "webcam-glow" | "motion-blur";

export interface FilterPreset {
  id: FilterId;
  label: string;
  css: string; // CSS filter string
  overlay?: { color: string; blend: string; opacity: number };
}

export const FILTERS: FilterPreset[] = [
  { id: "normal",       label: "Normal",       css: "none" },
  { id: "bw",           label: "B&W",          css: "grayscale(1) contrast(1.05)" },
  { id: "sepia",        label: "Sepia",        css: "sepia(0.85) contrast(1.05) brightness(1.02)" },
  { id: "vintage",      label: "Vintage",      css: "sepia(0.5) contrast(0.95) saturate(0.9) brightness(0.98)", overlay: { color: "#ffcc80", blend: "multiply", opacity: 0.15 } },
  { id: "warm",         label: "Warm",         css: "saturate(1.15) hue-rotate(-8deg) brightness(1.03)" },
  { id: "cool",         label: "Cool",         css: "saturate(1.05) hue-rotate(10deg) brightness(0.98)" },
  { id: "film",         label: "Film",         css: "contrast(1.1) saturate(0.9) sepia(0.15)", overlay: { color: "#3a2a1a", blend: "soft-light", opacity: 0.25 } },
  { id: "kodak",        label: "Kodak",        css: "saturate(1.25) contrast(1.1) sepia(0.1) brightness(1.02)" },
  { id: "fuji",         label: "Fuji",         css: "saturate(1.15) contrast(1.05) hue-rotate(-5deg)" },
  { id: "neon",         label: "Neon",         css: "saturate(2) contrast(1.2) brightness(1.1)", overlay: { color: "#ff00ff", blend: "screen", opacity: 0.12 } },
  { id: "cyberpunk",    label: "Cyberpunk",    css: "saturate(1.6) contrast(1.3) hue-rotate(-20deg)", overlay: { color: "#00e5ff", blend: "overlay", opacity: 0.18 } },
  { id: "dream",        label: "Dream",        css: "blur(0.5px) saturate(1.1) brightness(1.08) contrast(0.95)", overlay: { color: "#ffd6f0", blend: "soft-light", opacity: 0.25 } },
  { id: "soft",         label: "Soft",         css: "contrast(0.92) brightness(1.05) saturate(0.95)" },
  { id: "pastel",       label: "Pastel",       css: "saturate(0.85) brightness(1.1) contrast(0.95)", overlay: { color: "#ffe4ec", blend: "soft-light", opacity: 0.35 } },
  { id: "hdr",          label: "HDR",          css: "contrast(1.25) saturate(1.3) brightness(1.02)" },
  { id: "highcontrast", label: "High Contrast",css: "contrast(1.4) saturate(1.1)" },
  { id: "lowcontrast",  label: "Low Contrast", css: "contrast(0.8) brightness(1.05)" },
  { id: "bright",       label: "Bright",       css: "brightness(1.2) saturate(1.05)" },
  { id: "dark",         label: "Dark",         css: "brightness(0.8) contrast(1.1)" },
  { id: "sharpen",      label: "Sharpen",      css: "contrast(1.15) saturate(1.1) brightness(1.02)" },
  { id: "noir",         label: "Noir",         css: "grayscale(1) contrast(1.35) brightness(0.95)" },
  { id: "glow",         label: "Glow",         css: "brightness(1.1) contrast(1.05) saturate(1.15)", overlay: { color: "#fff2a8", blend: "screen", opacity: 0.2 } },
  { id: "vhs",          label: "VHS",          css: "saturate(1.4) contrast(1.05) hue-rotate(5deg)", overlay: { color: "#ff2d95", blend: "difference", opacity: 0.08 } },
  { id: "retro",        label: "Retro",        css: "sepia(0.35) saturate(1.2) contrast(1.05)", overlay: { color: "#ffb37b", blend: "overlay", opacity: 0.2 } },
  { id: "invert",       label: "Invert",       css: "invert(1) hue-rotate(180deg)" },
  { id: "cold",         label: "Cold",         css: "saturate(0.9) brightness(0.98) hue-rotate(20deg)", overlay: { color: "#a8d8ff", blend: "soft-light", opacity: 0.25 } },
  { id: "candy",        label: "Candy",        css: "saturate(1.3) brightness(1.05)", overlay: { color: "#ff9ec7", blend: "overlay", opacity: 0.22 } },
  { id: "sunset",       label: "Sunset",       css: "saturate(1.2) contrast(1.05)", overlay: { color: "#ff7043", blend: "soft-light", opacity: 0.3 } },
  { id: "mono",         label: "Mono",         css: "grayscale(1) sepia(0.2)" },
  { id: "clarity",      label: "Clarity",      css: "contrast(1.2) saturate(1.15) brightness(1.02)" },
  { id: "matte",        label: "Matte",        css: "contrast(0.9) saturate(0.85) brightness(1.05)" },
  
  // Snapchat-inspired presets
  { id: "twilight",     label: "Twilight camera",css: "saturate(1.2) hue-rotate(15deg) brightness(0.9) contrast(1.1)", overlay: { color: "#4b0082", blend: "screen", opacity: 0.15 } },
  { id: "bw-glasses",   label: "BW glasses",   css: "grayscale(1) contrast(1.5) brightness(0.9)" },
  { id: "cupid",        label: "Cupid x crown",css: "saturate(1.3) brightness(1.1)", overlay: { color: "#ffb6c1", blend: "soft-light", opacity: 0.4 } },
  { id: "polka-nerd",   label: "Dog polka nerd",css: "saturate(1.5) contrast(1.2)", overlay: { color: "#ffeb3b", blend: "overlay", opacity: 0.1 } },
  { id: "pookie",       label: "Head pookie",  css: "saturate(0.9) brightness(1.15) contrast(0.95)", overlay: { color: "#ffe4e1", blend: "soft-light", opacity: 0.3 } },
  { id: "blurish",      label: "Blurish",      css: "blur(2px) contrast(1.1) brightness(1.05)" },
  { id: "retro-heart",  label: "Retro heart flim",css: "sepia(0.4) saturate(1.2) contrast(1.1)", overlay: { color: "#ff4d4d", blend: "soft-light", opacity: 0.25 } },
  { id: "gray-flash",   label: "Flash in gray",css: "grayscale(0.8) brightness(1.3) contrast(1.2)" },
  { id: "mystic-glow",  label: "Mystic glow",  css: "saturate(1.4) brightness(1.1) contrast(1.05)", overlay: { color: "#8a2be2", blend: "screen", opacity: 0.2 } },
  { id: "bear-bear",    label: "We are bear bear",css: "sepia(0.3) saturate(1.2) brightness(0.95) contrast(1.05)", overlay: { color: "#8b4513", blend: "soft-light", opacity: 0.2 } },
  { id: "webcam-glow",  label: "Webcam glow",  css: "brightness(1.2) contrast(1.1) saturate(1.1) blur(0.5px)", overlay: { color: "#ffffff", blend: "soft-light", opacity: 0.15 } },
  { id: "motion-blur",  label: "Motion blur",  css: "blur(4px) contrast(1.2) saturate(1.1)" },
];

export const getFilter = (id: FilterId): FilterPreset =>
  FILTERS.find(f => f.id === id) ?? FILTERS[0];

export interface LiveAdjust {
  brightness: number; // 0..2
  contrast: number;   // 0..2
  saturation: number; // 0..2
  hue: number;        // -180..180
  blur: number;       // 0..8 px
}
export const DEFAULT_ADJUST: LiveAdjust = {
  brightness: 1, contrast: 1, saturation: 1, hue: 0, blur: 0,
};
export function adjustToCss(a: LiveAdjust): string {
  const parts: string[] = [];
  if (a.brightness !== 1) parts.push(`brightness(${a.brightness})`);
  if (a.contrast !== 1) parts.push(`contrast(${a.contrast})`);
  if (a.saturation !== 1) parts.push(`saturate(${a.saturation})`);
  if (a.hue !== 0) parts.push(`hue-rotate(${a.hue}deg)`);
  if (a.blur > 0) parts.push(`blur(${a.blur}px)`);
  return parts.length ? parts.join(" ") : "none";
}
export function combineFilterCss(preset: FilterPreset, adjust: LiveAdjust): string {
  const a = adjustToCss(adjust);
  if (preset.css === "none" && a === "none") return "none";
  if (preset.css === "none") return a;
  if (a === "none") return preset.css;
  return `${preset.css} ${a}`;
}