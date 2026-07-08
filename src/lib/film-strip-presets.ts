import type { FilmStripConfig } from "./film-strip";

// Base defaults; presets override selectively.
const base: Omit<FilmStripConfig, "id" | "label"> = {
  perStrip: 4,
  strips: 2,
  bg: "#ffffff",
  filmColor: "#0d0d0d",
  sprocketColor: "#ffffff",
  cellBg: "#1a1a1a",
  borderThickness: 22,
  cornerRadius: 26,
  shadow: true,
  innerSpacing: 14,
  outerMargin: 48,
  stripSpacing: 44,
  gutter: 46,
  sprocketSize: 22,
  sprocketGap: 16,
  sprocketRadius: 6,
  photoRadius: 6,
  brandingHeight: 150,
  brandingBg: undefined,
  brandingTextColor: "#0d0d0d",
  brandingAccent: undefined,
  eventName: "SnapBooth",
  showEventName: true,
  showDate: true,
  dateFormat: "long",
  showLogo: true,
  logoText: "SNAPBOOTH",
  showQr: false,
  brandingPosition: "bottom",
  fontFamily: '"Fraunces", Georgia, serif',
  labelUppercase: true,
};

function preset(id: string, label: string, over: Partial<FilmStripConfig> = {}): FilmStripConfig {
  return { ...base, id, label, ...over };
}

export const FILM_STRIP_PRESETS: FilmStripConfig[] = [
  preset("dual-vertical", "Dual Vertical"),
  preset("minimal-white", "Minimal White", {
    filmColor: "#111111", bg: "#ffffff", brandingTextColor: "#111111", labelUppercase: false,
    logoText: "snapbooth", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', shadow: false,
    borderThickness: 18, cornerRadius: 18, sprocketColor: "#ffffff",
  }),
  preset("retro-film", "Retro Film", {
    bg: "#f6ecd0", filmColor: "#181410", sprocketColor: "#f6ecd0",
    brandingTextColor: "#3a2a10", brandingAccent: "#a67a2c", logoText: "RETRO 35",
    fontFamily: '"Fraunces", serif',
  }),
  preset("vintage-brown", "Vintage Brown", {
    bg: "#e8d9b6", filmColor: "#3a2210", sprocketColor: "#e8d9b6",
    brandingTextColor: "#3a2210", brandingAccent: "#7a4a24", logoText: "KODACOLOR",
    fontFamily: '"Fraunces", serif',
  }),
  preset("polaroid-strip", "Polaroid Strip", {
    perStrip: 3, filmColor: "#ffffff", bg: "#f2ede4", sprocketColor: "#f2ede4",
    borderThickness: 32, cornerRadius: 12, cellBg: "#111111",
    brandingTextColor: "#111111", brandingBg: "#ffffff", brandingAccent: undefined,
    logoText: "polaroid", labelUppercase: false, fontFamily: '"Fraunces", serif',
  }),
  preset("wedding-strip", "Wedding", {
    bg: "#faf4ec", filmColor: "#1a0f0a", sprocketColor: "#faf4ec",
    brandingTextColor: "#7a5a32", brandingAccent: "#c9a24c",
    eventName: "Forever & Always", logoText: "♥", fontFamily: '"Fraunces", serif',
    labelUppercase: false,
  }),
  preset("birthday-strip", "Birthday", {
    bg: "#8bd3dd", filmColor: "#001858", sprocketColor: "#8bd3dd",
    brandingTextColor: "#001858", brandingAccent: "#ffb84c",
    eventName: "Happy Birthday", logoText: "🎉",
  }),
  preset("luxury-gold", "Luxury Gold", {
    bg: "#0d0d0d", filmColor: "#171310", sprocketColor: "#c9a84c",
    brandingTextColor: "#e8c07a", brandingAccent: "#c9a84c", brandingBg: "#0d0d0d",
    cellBg: "#0d0d0d", logoText: "MAISON", eventName: "Grand Soirée",
    fontFamily: '"Fraunces", serif',
  }),
  preset("neon-strip", "Neon", {
    bg: "#0a0a12", filmColor: "#141428", sprocketColor: "#ff2a95",
    brandingTextColor: "#00e5ff", brandingAccent: "#ff2a95",
    logoText: "NEON.NIGHT", fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  }),
  preset("scrapbook", "Scrapbook", {
    bg: "#f3ead6", filmColor: "#3a2a1a", sprocketColor: "#f3ead6",
    brandingTextColor: "#3a2a1a", brandingAccent: "#c94a2a",
    logoText: "scrapbook", labelUppercase: false,
    fontFamily: '"Fraunces", serif', cornerRadius: 32,
  }),
  preset("magazine-cover", "Magazine Cover", {
    strips: 1, perStrip: 4, bg: "#f5f1e8", filmColor: "#0d0d0d",
    sprocketColor: "#f5f1e8", brandingTextColor: "#0d0d0d",
    brandingAccent: "#e63946", logoText: "VOGUE-STYLE",
    fontFamily: '"Fraunces", serif', outerMargin: 72,
  }),
  preset("instagram-grid", "Instagram Grid", {
    perStrip: 3, bg: "#ffffff", filmColor: "#0d0d0d",
    sprocketColor: "#ffffff", brandingTextColor: "#0d0d0d",
    logoText: "@snapbooth", labelUppercase: false,
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
  }),
  preset("passport-sheet", "Passport", {
    perStrip: 4, bg: "#ffffff", filmColor: "#111111",
    sprocketColor: "#ffffff", brandingTextColor: "#111111",
    logoText: "PASSPORT", brandingHeight: 110, showDate: true,
  }),
];

export const getFilmStripPreset = (id: string): FilmStripConfig =>
  FILM_STRIP_PRESETS.find((p) => p.id === id) ?? FILM_STRIP_PRESETS[0];
