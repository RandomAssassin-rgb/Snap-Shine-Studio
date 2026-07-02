# 📸 Snap & Shine Studio

> **The quiet luxury of a perfect frame.**  
> An editorial, browser-based photobooth for weddings, salons, soirées, and every moment worth remembering.

---

## ✨ Overview

**Snap & Shine Studio** is a premium, fully browser-based photobooth web application. No downloads, no plugins, no queues. Just open a browser, point a camera, and generate beautiful, print-quality photo strips in seconds.

Designed with an editorial aesthetic — think couture fashion house meets analogue film — it combines a rich template library, real-time filters, AI-powered image tools, and canvas-rendered exports that scale to 300 DPI print quality.

---

## 🚀 Live Preview

```
Local:    http://localhost:8080/
```

---

## 🗂️ Project Structure

```
src/
├── assets/              # Static assets (logo, etc.)
├── components/
│   ├── film-strip/      # Film strip editor, preview & drag-reorder
│   │   ├── FilmStripEditor.tsx
│   │   ├── FilmStripPreview.tsx
│   │   └── SortableShots.tsx
│   ├── site-header.tsx  # Global navigation header
│   └── ui/              # Radix UI + shadcn/ui component library
├── hooks/
│   ├── use-auth.ts      # Supabase auth context
│   └── use-camera.ts    # Camera access, mirror, switching, capture
├── integrations/
│   └── supabase/        # Supabase client & type bindings
├── lib/
│   ├── ai-tools.functions.ts   # OpenRouter AI image editing (server fn)
│   ├── film-strip-export.ts    # PNG / JPG / PDF canvas export
│   ├── film-strip-library.ts   # LocalStorage custom template CRUD
│   ├── film-strip-presets.ts   # 14 premium film strip presets
│   ├── film-strip.ts           # Film strip canvas renderer
│   ├── filters.ts              # Photo filter definitions (CSS + WebGL)
│   ├── layouts.ts              # 80+ layout definitions
│   ├── share.ts                # Web Share API + social links
│   ├── storage.ts              # Supabase storage helpers
│   └── strip.ts                # Classic strip canvas renderer
├── routes/
│   ├── __root.tsx       # App shell, meta tags, error boundaries
│   ├── index.tsx        # Landing page
│   ├── booth.tsx        # Main photobooth (layouts + filters)
│   ├── booth.film.tsx   # Classic Film Strips premium editor
│   ├── tools.tsx        # AI photo editing tools
│   ├── video.tsx        # Video booth
│   ├── gallery.tsx      # Photo gallery
│   ├── edit.$stripId.tsx
│   ├── event.$eventId.tsx
│   └── print.$stripId.tsx
└── styles.css           # Global CSS + design tokens
```

---

## 🎨 Features

### 📷 Photo Booth (`/booth`)
- **Live camera preview** with real-time filter rendering
- **3, 5 or 10-second countdown** with voice and shutter sound
- **Mirror mode** — keyboard shortcut `M`
- **Flash effect** on capture
- **Retake individual shots** or clear all
- **Keyboard shortcuts**: `Space` = capture · `R` = retake last · `M` = mirror

### 🎞️ Classic Film Strips (`/booth/film`) — Premium
A dedicated editor inspired by classic analogue 35mm film.

**14 Premium Presets:**
| Preset | Style |
|---|---|
| Dual Vertical | Classic black film, dual strips |
| Minimal White | Clean, modern sans-serif |
| Retro Film | Warm aged tones |
| Vintage Brown | Kodacolor inspired |
| Polaroid Strip | White border, Polaroid feel |
| Wedding | Elegant ivory & gold |
| Birthday | Sky blue party vibes |
| Luxury Gold | Dark background, gold accents |
| Neon | Cyberpunk pink & cyan |
| Scrapbook | Craft paper texture |
| Magazine Cover | Editorial single strip |
| Instagram Grid | Social-first 3-up |
| Passport | Classic 4-cell ID format |
| Hatk Black | Custom dual-strip black (inspired by the Hatk brand) |

**Full Customization:**
- Background, film border & sprocket colors
- Border thickness, corner radius, shadow
- Inner spacing, outer margins, strip spacing
- Sprocket size & gap
- Branding: event name, logo text, date format
- Show/hide: event name, date, logo, QR code
- Logo/text position (top / bottom / hidden)
- Font family toggle

**Photo Options:**
- 2–6 photos per strip
- 1 or 2 strips side by side
- Drag-and-drop reordering
- Duplicate & randomize

**Export:**
| Format | Resolutions |
|---|---|
| PNG | 1080×1920, 2048×4096 |
| JPG | 1080×1920, 2048×4096 |
| PDF | 1080×1920, 2048×4096 |

**Template Library:**
- Save custom templates to LocalStorage
- Rename, duplicate, favorite, delete
- Search by name across all templates
- Favorites sorted to the top

### 🖼️ Layout Templates (`/booth` → Layout tab)
**80+ layouts** across 8 categories:

| Category | Count | Examples |
|---|---|---|
| Classic | 10 | Single, Strip, Polaroid, Passport, Instagram |
| Editorial | 18 | Noir, Champagne, Obsidian, Rose, Midnight, Bordeaux |
| Grid | 4 | Grid 4 Noir, Grid 6 Cream, Grid 9 Noir |
| Wedding | 10 | Wedding, Engagement, Bachelorette, Boho, Beach |
| Milestone | 11 | Birthday, Graduation, Prom, Baptism, Bar Mitzvah |
| Seasonal | 8 | Christmas, Diwali, Eid, Halloween, Valentine |
| Party | 7 | Concert, Festival, Pool Party, Housewarming |
| Corporate | 2 | Corporate Gala, Product Launch |

### 🎭 Filters
Real-time CSS/WebGL filters applied live to the camera preview and baked into exports:
- Brightness, contrast, saturation, hue, blur adjustments
- Preset filters: Normal, B&W, Sepia, Vivid, Faded, Film, Cyberpunk, VHS, and more

### 🤖 AI Tools (`/tools`)
AI-powered photo editing powered by **OpenRouter** (Google Gemini Flash):
- **Background removal** — clean transparent PNG output
- **Beauty retouch** — skin smoothing, eye brightening, color balance
- **Enhance** — upscale, sharpen, noise reduction
- **Custom prompt** — any free-form edit (e.g. "add a party hat")
- Background color replacement (Transparent, White, Black, Cream, Sky Blue, Pastel Pink)

### 📹 Video Booth (`/video`)
- Record short video clips in the browser
- Apply filters to video
- Download or share directly

### 🔗 Share & Export
- **Web Share API** — native share sheet on mobile
- **Social links** — WhatsApp, Telegram, X, Facebook
- **QR code** — print & scan at events
- **Cloud upload** — save strips to Supabase gallery

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | TanStack Router (file-based) |
| Server Functions | TanStack Start |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI + shadcn/ui |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| AI | OpenRouter API (google/gemini-2.0-flash-exp) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Canvas Rendering | Native HTML Canvas API |
| Export | jsPDF (PDF) + Canvas (PNG/JPG) |
| Camera | MediaDevices API (`getUserMedia`) |
| Fonts | Fraunces (display) + Plus Jakarta Sans (body) |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following:

```env
# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_KEY="your-service-key"
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="your-supabase-url"

# AI (OpenRouter)
OPENROUTER_API_KEY="your-openrouter-key"

# Google Gemini (optional, for future direct use)
GEMINI_API_KEY="your-gemini-key"
```

> ⚠️ **Never commit API keys to git.** The `.env` file is listed in `.gitignore`.

---

## 🏃 Getting Started

### Prerequisites
- **Node.js** v18+ 
- **npm** (or Bun — the project also ships a `bunfig.toml`)

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
# or: node node_modules/vite/bin/vite.js dev
```

The app will be available at:
- **Local:** `http://localhost:8080/`
- **Network:** `http://<your-ip>:8080/`

### Build for Production

```bash
npm run build
```

### Other Scripts

```bash
npm run lint      # ESLint
npm run format    # Prettier
npm run preview   # Preview production build
```

---

## 📱 Mobile Support

Snap & Shine Studio is fully responsive and touch-optimized:
- **Camera switching** — front/rear camera toggle
- **Touch-friendly controls** — large tap targets, swipe-friendly
- **PWA-ready** — `manifest.webmanifest` + `vite-plugin-pwa` installed
- **Mobile share** — native share sheet via Web Share API

---

## 🗺️ Routes

| Route | Description |
|---|---|
| `/` | Landing page / home |
| `/booth` | Main photobooth — layouts, filters, capture |
| `/booth/film` | Classic Film Strips premium editor |
| `/video` | Video booth |
| `/tools` | AI photo editing tools |
| `/gallery` | Cloud photo gallery |
| `/account` | User account & events |
| `/admin` | Admin panel |
| `/auth` | Sign in / sign up |
| `/edit/:stripId` | Edit a saved strip |
| `/event/:eventId` | Live event gallery (guest QR scan) |
| `/print/:stripId` | Print-optimized strip view |

---

## 🎨 Design System

The app uses a curated dark-mode-first design system with:

- **Primary font:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (display, italic)
- **Body font:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Gold accent:** `oklch(0.75 0.12 75)` — used throughout for premium feel
- **Glassmorphism:** `backdrop-blur` panels with subtle borders
- **Grain texture:** CSS noise overlay for editorial depth
- **Animations:** Framer Motion spring physics on all key interactions

---

## 🤝 Contributing

This project is connected to [Lovable](https://lovable.dev). 

> **Important:** Do not force-push, rebase, amend, or squash commits that are already pushed. This rewrites history on Lovable's side. Keep the main branch in a working state at all times.

---

## 📄 License

© 2026 Snap & Shine Studio — All frames reserved.
