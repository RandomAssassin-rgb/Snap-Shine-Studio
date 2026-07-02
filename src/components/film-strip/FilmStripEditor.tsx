import type { FilmStripConfig } from "@/lib/film-strip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  config: FilmStripConfig;
  onChange: (next: FilmStripConfig) => void;
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded-md border border-border bg-transparent"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-24 font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, unit, onChange,
}: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">{value}{unit ?? ""}</span>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

export function FilmStripEditor({ config, onChange }: Props) {
  const set = <K extends keyof FilmStripConfig>(k: K, v: FilmStripConfig[K]) => onChange({ ...config, [k]: v });

  return (
    <div className="space-y-5 text-sm">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Layout</p>
        <SliderRow label="Photos per strip" value={config.perStrip} min={2} max={6} step={1} onChange={(v) => set("perStrip", v)} />
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Number of strips</Label>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {[1, 2].map((n) => (
              <button
                key={n}
                onClick={() => set("strips", n as 1 | 2)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${config.strips === n ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >{n}</button>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Colors</p>
        <ColorRow label="Background" value={config.bg} onChange={(v) => set("bg", v)} />
        <ColorRow label="Film border" value={config.filmColor} onChange={(v) => set("filmColor", v)} />
        <ColorRow label="Sprocket" value={config.sprocketColor} onChange={(v) => set("sprocketColor", v)} />
        <ColorRow label="Text" value={config.brandingTextColor} onChange={(v) => set("brandingTextColor", v)} />
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Shape & spacing</p>
        <SliderRow label="Border thickness" value={config.borderThickness} min={6} max={80} step={1} unit="px" onChange={(v) => set("borderThickness", v)} />
        <SliderRow label="Corner radius" value={config.cornerRadius} min={0} max={80} step={1} unit="px" onChange={(v) => set("cornerRadius", v)} />
        <SliderRow label="Inner spacing" value={config.innerSpacing} min={0} max={60} step={1} unit="px" onChange={(v) => set("innerSpacing", v)} />
        <SliderRow label="Outer margin" value={config.outerMargin} min={0} max={140} step={2} unit="px" onChange={(v) => set("outerMargin", v)} />
        <SliderRow label="Strip spacing" value={config.stripSpacing} min={0} max={120} step={2} unit="px" onChange={(v) => set("stripSpacing", v)} />
        <SliderRow label="Sprocket size" value={config.sprocketSize} min={8} max={44} step={1} unit="px" onChange={(v) => set("sprocketSize", v)} />
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Shadow</Label>
          <Switch checked={config.shadow} onCheckedChange={(v) => set("shadow", v)} />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Branding</p>
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Position</Label>
          <Select value={config.brandingPosition} onValueChange={(v) => set("brandingPosition", v as FilmStripConfig["brandingPosition"])}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Event name</Label>
          <Input value={config.eventName ?? ""} onChange={(e) => set("eventName", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Logo text</Label>
          <Input value={config.logoText ?? ""} onChange={(e) => set("logoText", e.target.value)} className="mt-1" />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Date format</Label>
          <Select value={config.dateFormat} onValueChange={(v) => set("dateFormat", v as FilmStripConfig["dateFormat"])}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="iso">ISO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            Event name <Switch checked={config.showEventName} onCheckedChange={(v) => set("showEventName", v)} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            Date <Switch checked={config.showDate} onCheckedChange={(v) => set("showDate", v)} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            Logo <Switch checked={config.showLogo} onCheckedChange={(v) => set("showLogo", v)} />
          </label>
          <label className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            QR <Switch checked={config.showQr} onCheckedChange={(v) => set("showQr", v)} />
          </label>
          <label className="col-span-2 flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            Uppercase labels <Switch checked={config.labelUppercase} onCheckedChange={(v) => set("labelUppercase", v)} />
          </label>
        </div>
      </div>
    </div>
  );
}
