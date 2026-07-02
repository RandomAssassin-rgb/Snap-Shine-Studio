import type { FilmStripConfig } from "./film-strip";

const KEY = "snapbooth.filmstrip.library.v1";
const FAV_KEY = "snapbooth.filmstrip.favorites.v1";

export interface StoredTemplate {
  key: string;               // unique key (custom-<ts>)
  config: FilmStripConfig;
  createdAt: number;
  updatedAt: number;
}

function read(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredTemplate[]) : [];
  } catch { return []; }
}
function write(list: StoredTemplate[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
function readFavs(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}
function writeFavs(list: string[]) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export const filmStripLibrary = {
  list(): StoredTemplate[] { return read(); },
  save(cfg: FilmStripConfig): StoredTemplate {
    const list = read();
    const key = `custom-${Date.now()}`;
    const t: StoredTemplate = { key, config: { ...cfg, id: key }, createdAt: Date.now(), updatedAt: Date.now() };
    list.unshift(t);
    write(list);
    return t;
  },
  duplicate(key: string): StoredTemplate | null {
    const list = read();
    const src = list.find((t) => t.key === key);
    if (!src) return null;
    const nk = `custom-${Date.now()}`;
    const t: StoredTemplate = {
      key: nk,
      config: { ...src.config, id: nk, label: `${src.config.label} copy` },
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    list.unshift(t); write(list); return t;
  },
  rename(key: string, label: string) {
    const list = read();
    const i = list.findIndex((t) => t.key === key);
    if (i < 0) return;
    list[i] = { ...list[i], config: { ...list[i].config, label }, updatedAt: Date.now() };
    write(list);
  },
  remove(key: string) {
    write(read().filter((t) => t.key !== key));
    writeFavs(readFavs().filter((k) => k !== key));
  },
  update(key: string, cfg: FilmStripConfig) {
    const list = read();
    const i = list.findIndex((t) => t.key === key);
    if (i < 0) return;
    list[i] = { ...list[i], config: { ...cfg, id: key }, updatedAt: Date.now() };
    write(list);
  },
  favorites(): string[] { return readFavs(); },
  isFavorite(key: string): boolean { return readFavs().includes(key); },
  toggleFavorite(key: string) {
    const favs = readFavs();
    const has = favs.includes(key);
    writeFavs(has ? favs.filter((k) => k !== key) : [key, ...favs]);
  },
};
