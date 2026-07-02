export type LayoutId =
  | "single" | "two" | "three" | "four" | "six" | "nine"
  | "polaroid" | "square" | "instagram" | "passport"
  | "wedding" | "birthday"
  // Editorial strips
  | "noir-strip" | "champagne-strip" | "obsidian-strip" | "ivory-strip"
  | "rose-strip" | "sage-strip" | "midnight-strip" | "bordeaux-strip"
  | "cognac-strip" | "porcelain-strip" | "ink-strip" | "linen-strip"
  | "duo-noir" | "duo-champagne" | "duo-blush"
  | "quad-noir" | "quad-champagne" | "quad-rose"
  // Grids
  | "grid-4-noir" | "grid-6-cream" | "grid-9-noir" | "grid-9-champagne"
  // Themed events
  | "engagement" | "anniversary" | "valentine" | "christmas" | "newyear"
  | "halloween" | "easter" | "diwali" | "eid" | "thanksgiving"
  | "graduation" | "prom" | "baby-shower" | "gender-reveal" | "first-birthday"
  | "sweet-sixteen" | "quinceanera" | "bar-mitzvah" | "baptism"
  | "bachelorette" | "bachelor" | "bridal-shower"
  | "boho-wedding" | "rustic-wedding" | "beach-wedding" | "winter-wedding"
  | "corporate" | "product-launch" | "farewell" | "welcome"
  | "housewarming" | "pool-party" | "reunion" | "retirement"
  | "concert" | "festival";

export interface LayoutDef {
  id: LayoutId;
  label: string;
  category?: "Classic" | "Editorial" | "Grid" | "Wedding" | "Party" | "Seasonal" | "Milestone" | "Corporate";
  shots: number;
  // Strip render config
  width: number;   // px at 300dpi-ish print quality
  height: number;
  cols: number;
  rows: number;
  aspect: number;  // per-cell aspect w/h
  padding: number;
  gap: number;
  bg: string;
  labelText?: string;
  labelColor?: string;
  accent?: string;
  emoji?: string;
}

export const LAYOUTS: LayoutDef[] = [
  // Classic
  { id: "single",    label: "Single",         category: "Classic", shots: 1, width: 1200, height: 1200, cols: 1, rows: 1, aspect: 1,   padding: 48, gap: 0,  bg: "#fef6e4" },
  { id: "two",       label: "2 Shots strip",  category: "Classic", shots: 2, width: 720,  height: 1600, cols: 1, rows: 2, aspect: 4/3, padding: 40, gap: 24, bg: "#fef6e4", labelText: "PHOTOBOOTH" },
  { id: "three",     label: "Classic strip",  category: "Classic", shots: 3, width: 720,  height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 40, gap: 24, bg: "#fef6e4", labelText: "PHOTOBOOTH" },
  { id: "four",      label: "4 up",           category: "Classic", shots: 4, width: 720,  height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 24, bg: "#001858", labelText: "PHOTOBOOTH", labelColor: "#fef6e4", accent: "#8bd3dd" },
  { id: "six",       label: "6 grid",         category: "Grid",    shots: 6, width: 1400, height: 2000, cols: 2, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#f3d2c1" },
  { id: "nine",      label: "9 grid",         category: "Grid",    shots: 9, width: 1600, height: 1600, cols: 3, rows: 3, aspect: 1,   padding: 48, gap: 20, bg: "#fef6e4" },
  { id: "polaroid",  label: "Polaroid",       category: "Classic", shots: 1, width: 1000, height: 1200, cols: 1, rows: 1, aspect: 1,   padding: 60, gap: 0,  bg: "#ffffff", labelText: "moment", labelColor: "#001858" },
  { id: "square",    label: "Square",         category: "Classic", shots: 1, width: 1200, height: 1200, cols: 1, rows: 1, aspect: 1,   padding: 0,  gap: 0,  bg: "#000000" },
  { id: "instagram", label: "Instagram",      category: "Classic", shots: 1, width: 1080, height: 1350, cols: 1, rows: 1, aspect: 4/5, padding: 0,  gap: 0,  bg: "#000000" },
  { id: "passport",  label: "Passport",       category: "Classic", shots: 4, width: 1200, height: 1600, cols: 2, rows: 2, aspect: 3/4, padding: 40, gap: 16, bg: "#ffffff" },

  // Editorial strips (couture)
  { id: "noir-strip",       label: "Noir",       category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#0d0d0d", labelText: "MAISON", labelColor: "#e8c07a", accent: "#e8c07a" },
  { id: "champagne-strip",  label: "Champagne",  category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#f5ecd7", labelText: "SNAPBOOTH", labelColor: "#8a6a2c" },
  { id: "obsidian-strip",   label: "Obsidian",   category: "Editorial", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#111111", labelText: "SOIRÉE", labelColor: "#d4af5a", accent: "#c9a84c" },
  { id: "ivory-strip",      label: "Ivory",      category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#fbf7ef", labelText: "atelier", labelColor: "#7a6a52" },
  { id: "rose-strip",       label: "Rose",       category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#f4dcd6", labelText: "en rose", labelColor: "#8a3a4a" },
  { id: "sage-strip",       label: "Sage",       category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#dbe5d1", labelText: "jardin", labelColor: "#3f5a3a" },
  { id: "midnight-strip",   label: "Midnight",   category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#0a1a3a", labelText: "MINUIT", labelColor: "#e8d7a8", accent: "#d4af5a" },
  { id: "bordeaux-strip",   label: "Bordeaux",   category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#3d1220", labelText: "BORDEAUX", labelColor: "#e8c07a", accent: "#c9a84c" },
  { id: "cognac-strip",     label: "Cognac",     category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#7a4a24", labelText: "COGNAC", labelColor: "#f5e6c8" },
  { id: "porcelain-strip",  label: "Porcelain",  category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#f7f7f7", labelText: "porcelain", labelColor: "#2d2d2d" },
  { id: "ink-strip",        label: "Ink",        category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 44, gap: 22, bg: "#111827", labelText: "ENCRE", labelColor: "#f5f0e0" },
  { id: "linen-strip",      label: "Linen",      category: "Editorial", shots: 3, width: 720, height: 2000, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#ece3d0", labelText: "linen", labelColor: "#5a4a30" },
  { id: "duo-noir",         label: "Duo Noir",   category: "Editorial", shots: 2, width: 720, height: 1600, cols: 1, rows: 2, aspect: 4/3, padding: 44, gap: 22, bg: "#0d0d0d", labelText: "DUO", labelColor: "#e8c07a" },
  { id: "duo-champagne",    label: "Duo Champagne", category: "Editorial", shots: 2, width: 720, height: 1600, cols: 1, rows: 2, aspect: 4/3, padding: 44, gap: 22, bg: "#f5ecd7", labelText: "DUO", labelColor: "#8a6a2c" },
  { id: "duo-blush",        label: "Duo Blush",  category: "Editorial", shots: 2, width: 720, height: 1600, cols: 1, rows: 2, aspect: 4/3, padding: 44, gap: 22, bg: "#f8dfd5", labelText: "duo", labelColor: "#8a3a4a" },
  { id: "quad-noir",        label: "Quad Noir",  category: "Editorial", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#0d0d0d", labelText: "QUARTET", labelColor: "#e8c07a", accent: "#c9a84c" },
  { id: "quad-champagne",   label: "Quad Champagne", category: "Editorial", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#f5ecd7", labelText: "QUARTET", labelColor: "#8a6a2c" },
  { id: "quad-rose",        label: "Quad Rose",  category: "Editorial", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#f4dcd6", labelText: "quartet", labelColor: "#8a3a4a" },

  // Grids
  { id: "grid-4-noir",      label: "Grid 4 Noir",     category: "Grid", shots: 4, width: 1200, height: 1200, cols: 2, rows: 2, aspect: 1,   padding: 40, gap: 20, bg: "#0d0d0d", labelText: "MOSAIC", labelColor: "#e8c07a" },
  { id: "grid-6-cream",     label: "Grid 6 Cream",    category: "Grid", shots: 6, width: 1400, height: 2000, cols: 2, rows: 3, aspect: 4/3, padding: 48, gap: 22, bg: "#faf6ec", labelText: "collection", labelColor: "#6a5a3a" },
  { id: "grid-9-noir",      label: "Grid 9 Noir",     category: "Grid", shots: 9, width: 1600, height: 1600, cols: 3, rows: 3, aspect: 1,   padding: 40, gap: 18, bg: "#0d0d0d", labelText: "NINE", labelColor: "#e8c07a" },
  { id: "grid-9-champagne", label: "Grid 9 Champagne",category: "Grid", shots: 9, width: 1600, height: 1600, cols: 3, rows: 3, aspect: 1,   padding: 40, gap: 18, bg: "#f5ecd7", labelText: "nine", labelColor: "#8a6a2c" },

  // Wedding
  { id: "wedding",          label: "Wedding",         category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#faf6f0", labelText: "Forever & always", labelColor: "#a58a6a", emoji: "💍" },
  { id: "engagement",       label: "Engagement",      category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#f8e6ea", labelText: "She said yes", labelColor: "#8a3a4a", emoji: "💍" },
  { id: "anniversary",      label: "Anniversary",     category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#3d1220", labelText: "Cheers to us", labelColor: "#e8c07a", emoji: "🥂" },
  { id: "bridal-shower",    label: "Bridal Shower",   category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#fef0f4", labelText: "Bride to be", labelColor: "#c94a6a", emoji: "👰" },
  { id: "bachelorette",     label: "Bachelorette",    category: "Wedding", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#ffb6d0", labelText: "Last fling", labelColor: "#2d0d20", emoji: "💃" },
  { id: "bachelor",         label: "Bachelor",        category: "Wedding", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#141414", labelText: "Last ride", labelColor: "#e8c07a", emoji: "🥃" },
  { id: "boho-wedding",     label: "Boho Wedding",    category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#e8dcc4", labelText: "wild love", labelColor: "#6a4a2a", emoji: "🌾" },
  { id: "rustic-wedding",   label: "Rustic Wedding",  category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#d8c3a0", labelText: "hand in hand", labelColor: "#4a2a10", emoji: "🌿" },
  { id: "beach-wedding",    label: "Beach Wedding",   category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#cfe8f0", labelText: "salt & sea", labelColor: "#0a3a5a", emoji: "🐚" },
  { id: "winter-wedding",   label: "Winter Wedding",  category: "Wedding", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 28, bg: "#f2f5f7", labelText: "winter vows", labelColor: "#3a4a5a", emoji: "❄️" },

  // Milestones
  { id: "birthday",         label: "Birthday",        category: "Milestone", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 24, bg: "#8bd3dd", labelText: "HAPPY BIRTHDAY", labelColor: "#001858", emoji: "🎉" },
  { id: "first-birthday",   label: "First Birthday",  category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#fff1d6", labelText: "one!", labelColor: "#c07a2a", emoji: "🧁" },
  { id: "sweet-sixteen",    label: "Sweet 16",        category: "Milestone", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#ffd6ea", labelText: "sweet sixteen", labelColor: "#8a2a4a", emoji: "🎀" },
  { id: "quinceanera",      label: "Quinceañera",     category: "Milestone", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#3d1220", labelText: "Mis quince", labelColor: "#e8c07a", emoji: "👑" },
  { id: "bar-mitzvah",      label: "Bar Mitzvah",     category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0a1a3a", labelText: "Mazel tov", labelColor: "#e8c07a", emoji: "✡️" },
  { id: "baptism",          label: "Baptism",         category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#f7f5f0", labelText: "blessed day", labelColor: "#6a7a8a", emoji: "🕊️" },
  { id: "baby-shower",      label: "Baby Shower",     category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#e4f0e8", labelText: "little one", labelColor: "#3a5a4a", emoji: "🍼" },
  { id: "gender-reveal",    label: "Gender Reveal",   category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#f5e8ec", labelText: "boy or girl?", labelColor: "#8a4a6a", emoji: "🎈" },
  { id: "graduation",       label: "Graduation",      category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0d0d0d", labelText: "Class of 2026", labelColor: "#e8c07a", emoji: "🎓" },
  { id: "prom",             label: "Prom",            category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#1a0a3a", labelText: "prom night", labelColor: "#e8c07a", emoji: "✨" },
  { id: "retirement",       label: "Retirement",      category: "Milestone", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#3a2a1a", labelText: "well earned", labelColor: "#e8c07a", emoji: "🥃" },

  // Seasonal
  { id: "valentine",        label: "Valentine",       category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#3a0a1a", labelText: "be mine", labelColor: "#f8b8c8", emoji: "❤️" },
  { id: "christmas",        label: "Christmas",       category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0a2a1a", labelText: "Merry & bright", labelColor: "#e8c07a", emoji: "🎄" },
  { id: "newyear",          label: "New Year",        category: "Seasonal", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#0d0d0d", labelText: "MMXXVI", labelColor: "#e8c07a", accent: "#c9a84c", emoji: "🥂" },
  { id: "halloween",        label: "Halloween",       category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#1a0a0d", labelText: "spooky szn", labelColor: "#ff8a2a", emoji: "🎃" },
  { id: "easter",           label: "Easter",          category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#fce8f0", labelText: "hoppy easter", labelColor: "#8a4a6a", emoji: "🐣" },
  { id: "thanksgiving",     label: "Thanksgiving",    category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#5a2a10", labelText: "grateful", labelColor: "#f5e6c8", emoji: "🍂" },
  { id: "diwali",           label: "Diwali",          category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#3a0a1a", labelText: "Shubh Diwali", labelColor: "#e8c07a", emoji: "🪔" },
  { id: "eid",              label: "Eid",             category: "Seasonal", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0a2a2a", labelText: "Eid Mubarak", labelColor: "#e8c07a", emoji: "🌙" },

  // Party
  { id: "pool-party",       label: "Pool Party",      category: "Party", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#4ac0e8", labelText: "poolside", labelColor: "#0a3a5a", emoji: "🩱" },
  { id: "concert",          label: "Concert",         category: "Party", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#0d0d0d", labelText: "LIVE", labelColor: "#ff2a6a", accent: "#ff2a6a", emoji: "🎤" },
  { id: "festival",         label: "Festival",        category: "Party", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#ff7a3a", labelText: "festival", labelColor: "#1a0a0d", emoji: "🎪" },
  { id: "reunion",          label: "Reunion",         category: "Party", shots: 4, width: 720, height: 2400, cols: 1, rows: 4, aspect: 4/3, padding: 40, gap: 22, bg: "#e8dcc4", labelText: "together again", labelColor: "#4a3a10", emoji: "🤝" },
  { id: "housewarming",     label: "Housewarming",    category: "Party", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#f3ead6", labelText: "our new home", labelColor: "#6a4a2a", emoji: "🏡" },
  { id: "welcome",          label: "Welcome",         category: "Party", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#fce8d5", labelText: "welcome home", labelColor: "#8a3a10", emoji: "🎊" },
  { id: "farewell",         label: "Farewell",        category: "Party", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#1a1a2e", labelText: "until next time", labelColor: "#e8c07a", emoji: "👋" },

  // Corporate
  { id: "corporate",        label: "Corporate",       category: "Corporate", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0f1b3d", labelText: "Company Gala", labelColor: "#e8edf3", accent: "#c9a84c" },
  { id: "product-launch",   label: "Product Launch",  category: "Corporate", shots: 3, width: 720, height: 2100, cols: 1, rows: 3, aspect: 4/3, padding: 48, gap: 24, bg: "#0d0d0d", labelText: "LAUNCH DAY", labelColor: "#e8c07a", accent: "#c9a84c" },
];

export const getLayout = (id: LayoutId): LayoutDef =>
  LAYOUTS.find(l => l.id === id) ?? LAYOUTS[2];

// Categories in the order they should be shown in the picker
export const LAYOUT_CATEGORIES: NonNullable<LayoutDef["category"]>[] = [
  "Editorial", "Classic", "Grid", "Wedding", "Milestone", "Seasonal", "Party", "Corporate",
];