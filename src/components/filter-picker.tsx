import type { Lens } from "@snap/camera-kit";
import { CUSTOM_AR_LENSES } from "@/hooks/use-custom-ar";
import { FILTERS } from "@/lib/filters";

interface FilterPickerProps {
  arLenses: Lens[];
  activeFilterId: string;
  onFilterSelect: (id: string) => void;
}

export function VerticalFilterRail({ arLenses, activeFilterId, onFilterSelect }: FilterPickerProps) {
  return (
    <aside className="hidden lg:block w-[90px] shrink-0">
      <div className="sticky top-20 rounded-3xl border border-gold/20 bg-card/60 p-3 shadow-pop backdrop-blur">
        <p className="mb-3 px-1 text-center text-[9px] uppercase tracking-[0.32em] text-gold">Filtres</p>
        <div className="hairline mb-3" />
        <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
          {/* AR Lenses */}
          {arLenses.map((lens) => {
            const active = activeFilterId === lens.id;
            return (
              <button
                key={lens.id}
                onClick={() => onFilterSelect(lens.id)}
                className={`group relative flex w-full flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                  active
                    ? "border-gold/70 bg-gradient-gold text-primary-foreground shadow-glow"
                    : "border-transparent hover:border-gold/30 hover:bg-secondary/60"
                }`}
                title={lens.name}
              >
                <img
                  src={lens.iconUrl}
                  alt={lens.name}
                  className={`h-10 w-10 rounded-xl object-cover ring-1 ring-inset ${active ? "ring-white/40" : "ring-border/60"}`}
                />
                <span className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {lens.name}
                </span>
              </button>
            );
          })}

          {/* Custom Studio AR Lenses */}
          {CUSTOM_AR_LENSES.map((lens) => {
            const active = activeFilterId === lens.id;
            return (
              <button
                key={lens.id}
                onClick={() => onFilterSelect(lens.id)}
                className={`group relative flex w-full flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                  active
                    ? "border-gold/70 bg-gradient-gold text-primary-foreground shadow-glow"
                    : "border-transparent hover:border-gold/30 hover:bg-secondary/60"
                }`}
                title={lens.name}
              >
                <img
                  src={lens.iconUrl}
                  alt={lens.name}
                  className={`h-10 w-10 rounded-xl object-cover ring-1 ring-inset bg-card ${active ? "ring-white/40" : "ring-border/60"}`}
                />
                <span className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {lens.name}
                </span>
              </button>
            );
          })}

          {/* Standard CSS Filters */}
          {FILTERS.map((f) => {
            const active = activeFilterId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onFilterSelect(f.id)}
                className={`group relative flex w-full flex-col items-center gap-1 rounded-2xl border p-2 transition ${
                  active
                    ? "border-gold/70 bg-gradient-gold text-primary-foreground shadow-glow"
                    : "border-transparent hover:border-gold/30 hover:bg-secondary/60"
                }`}
                title={f.label}
              >
                <span
                  aria-hidden
                  className={`h-10 w-10 rounded-xl ring-1 ring-inset ${active ? "ring-white/40" : "ring-border/60"}`}
                  style={{
                    backgroundImage: "linear-gradient(135deg,#8a6a2c 0%,#d4af5a 45%,#3a2a1a 100%)",
                    filter: f.css === "none" ? undefined : f.css,
                  }}
                />
                <span className={`w-full truncate text-center text-[9px] font-medium uppercase tracking-[0.14em] ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function MobileFilterStrip({ arLenses, activeFilterId, onFilterSelect }: FilterPickerProps) {
  return (
    <div className="mt-4 lg:hidden">
      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gold">Filters</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {arLenses.map((lens) => (
          <button
            key={lens.id}
            onClick={() => onFilterSelect(lens.id)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
              activeFilterId === lens.id
                ? "border-gold bg-gradient-gold text-primary-foreground shadow-glow"
                : "border-transparent bg-card hover:border-gold/30 hover:bg-secondary/60"
            }`}
          >
            <img src={lens.iconUrl} alt="" className="h-4 w-4 rounded-full object-cover ring-1 ring-white/20" />
            {lens.name}
          </button>
        ))}
        {CUSTOM_AR_LENSES.map((lens) => (
          <button
            key={lens.id}
            onClick={() => onFilterSelect(lens.id)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
              activeFilterId === lens.id
                ? "border-gold bg-gradient-gold text-primary-foreground shadow-glow"
                : "border-transparent bg-card hover:border-gold/30 hover:bg-secondary/60"
            }`}
          >
            <img src={lens.iconUrl} alt="" className="h-4 w-4 rounded-full object-cover ring-1 ring-white/20 bg-card" />
            {lens.name}
          </button>
        ))}
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterSelect(f.id)}
            className={`shrink-0 flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest transition ${
              activeFilterId === f.id
                ? "border-gold bg-gradient-gold text-primary-foreground shadow-glow"
                : "border-transparent bg-card hover:border-gold/30 hover:bg-secondary/60"
            }`}
          >
            {f.css !== "none" && (
              <span
                className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/20"
                style={{
                  backgroundImage: "linear-gradient(135deg,#8a6a2c 0%,#d4af5a 45%,#3a2a1a 100%)",
                  filter: f.css,
                }}
              />
            )}
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
