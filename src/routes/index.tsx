import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Camera, Sparkles, Share2, Images, Wand2, Users, ArrowUpRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { FILTERS } from "@/lib/filters";
import { LAYOUTS } from "@/lib/layouts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-soft grain">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-hero">
          {/* Ambient orbs */}
          <div aria-hidden className="pointer-events-none absolute -top-40 -left-20 h-[520px] w-[520px] rounded-full bg-gradient-gold opacity-[0.08] blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-gradient-gold opacity-[0.06] blur-3xl" />

          <div className="mx-auto max-w-6xl px-6 pt-20 pb-32 md:pt-28">
            {/* Eyebrow row */}
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              <span>Est. MMXXVI</span>
              <span className="hidden sm:inline">Maison Snapbooth · No. 001</span>
              <span>Édition Numérique</span>
            </div>
            <div className="hairline mt-4" />

            <div className="grid gap-14 pt-16 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-7">
                <motion.span
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/40 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-gold"
                >
                  <span className="h-1 w-1 rounded-full bg-gradient-gold" />
                  A photobooth, tailored
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7 }}
                  className="mt-8 font-display text-[3.4rem] font-light leading-[0.95] tracking-[-0.03em] md:text-[6.25rem]"
                >
                  The quiet<br />
                  luxury of a<br />
                  <span className="italic text-gradient-gold">perfect frame.</span>
                </motion.h1>

                <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  An editorial photobooth for weddings, salons and soirées.
                  {FILTERS.length}+ couture filters, {LAYOUTS.length} bespoke layouts,
                  and a live gallery that turns any evening into a keepsake.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link to="/booth">
                    <Button size="lg" className="group h-12 rounded-full bg-gradient-gold px-7 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground shadow-glow hover:opacity-90">
                      Enter the booth
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <div><div className="font-display text-2xl text-foreground">{FILTERS.length}+</div>Filters</div>
                  <div><div className="font-display text-2xl text-foreground">{LAYOUTS.length}</div>Layouts</div>
                  <div><div className="font-display text-2xl text-foreground">4K</div>Prints</div>
                </div>
              </div>

              {/* Editorial strip composition */}
              <div className="relative md:col-span-5">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-sm">
                  {/* Gold frame plate */}
                  <div aria-hidden className="absolute inset-4 rounded-[28px] bg-gradient-gold opacity-30 blur-2xl" />

                  {/* Back strip */}
                  <motion.div
                    initial={{ rotate: 8, y: 40, opacity: 0 }}
                    animate={{ rotate: 8, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 16, delay: 0.15 }}
                    className="absolute right-0 top-6 w-40 rounded-2xl bg-card p-2 shadow-tape ring-1 ring-gold/20"
                  >
                    <div className="h-24 rounded-lg bg-[radial-gradient(circle_at_30%_30%,oklch(0.7_0.15_60),oklch(0.2_0.02_60))]" />
                    <div className="mt-1 h-24 rounded-lg bg-[radial-gradient(circle_at_70%_60%,oklch(0.65_0.12_25),oklch(0.15_0.02_60))]" />
                    <p className="pt-2 text-center font-display text-[10px] italic tracking-widest text-gold">— maison —</p>
                  </motion.div>

                  {/* Front strip */}
                  <motion.div
                    initial={{ rotate: -5, y: 30, opacity: 0 }}
                    animate={{ rotate: -5, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 60, damping: 16 }}
                    className="absolute left-2 bottom-0 w-56 rounded-2xl bg-card p-3 shadow-pop ring-1 ring-gold/30"
                  >
                    <div className="mb-2 h-36 rounded-xl bg-[linear-gradient(135deg,oklch(0.4_0.06_60),oklch(0.75_0.11_82))]" />
                    <div className="mb-2 h-36 rounded-xl bg-[linear-gradient(135deg,oklch(0.25_0.03_60),oklch(0.55_0.09_40))]" />
                    <div className="mb-2 h-36 rounded-xl bg-[linear-gradient(135deg,oklch(0.82_0.11_82),oklch(0.35_0.05_60))]" />
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-display text-[10px] tracking-[0.3em] text-gold">SNAPBOOTH</span>
                      <span className="font-display text-[10px] italic text-muted-foreground">n° 001</span>
                    </div>
                  </motion.div>

                  {/* Tape */}
                  <div aria-hidden className="absolute -top-2 left-1/2 h-5 w-20 -translate-x-1/2 rotate-[-6deg] rounded-sm bg-gradient-gold opacity-70 shadow-tape" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <section aria-hidden className="relative overflow-hidden border-y border-border/60 bg-card/40 py-6">
          <div className="marquee font-display text-xl italic text-muted-foreground">
            {[..."Weddings · Ateliers · Galas · Fashion Week · Boutique Openings · Bar Mitzvahs · Rooftop Soirées · Private Members Clubs".split(" · "),
              ..."Weddings · Ateliers · Galas · Fashion Week · Boutique Openings · Bar Mitzvahs · Rooftop Soirées · Private Members Clubs".split(" · "),
            ].map((w, i) => (
              <span key={i} className="flex shrink-0 items-center gap-12">
                <span>{w}</span>
                <Star className="h-3 w-3 text-gold" />
              </span>
            ))}
          </div>
        </section>

        {/* FEATURES — editorial split */}
        <section className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Chapter I</p>
              <h2 className="mt-4 font-display text-5xl leading-tight tracking-[-0.02em]">
                A whole booth,<br />
                <span className="italic text-gradient-gold">reimagined.</span>
              </h2>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Six couture capabilities, no queues, no cabling, no downloads.
                Just a camera and an audience.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/40 md:col-span-8 md:grid-cols-2">
              {[
                { icon: Wand2, num: "01", title: `${FILTERS.length}+ couture filters`, body: "Sepia, Fuji, Cyberpunk, VHS, Pastel — rendered live at 60fps." },
                { icon: Camera, num: "02", title: `${LAYOUTS.length} bespoke layouts`, body: "Classic strip, 4-up, 9-grid, Polaroid, wedding & birthday templates." },
                { icon: Sparkles, num: "03", title: "Countdown & flash", body: "3, 5 or 10-second countdowns with cinematic flash and shutter." },
                { icon: Share2, num: "04", title: "One-tap share", body: "Web Share, WhatsApp, Telegram, X, Facebook, QR & clipboard." },
                { icon: Images, num: "05", title: "Private atelier", body: "Sign in and every strip is quietly kept in your cloud gallery." },
                { icon: Users, num: "06", title: "Live salon", body: "Print a QR — every photo appears on every guest's screen, live." },
              ].map((f) => (
                <div key={f.title} className="group relative bg-card p-8 transition-colors hover:bg-secondary">
                  <div className="flex items-start justify-between">
                    <f.icon className="h-5 w-5 text-gold" />
                    <span className="font-display text-xs tracking-[0.3em] text-muted-foreground">{f.num}</span>
                  </div>
                  <h3 className="mt-8 font-display text-xl tracking-[-0.01em]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-card p-14 text-center shadow-pop">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-70" />
            <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-gold opacity-20 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">La finale</p>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-5xl leading-[1.02] tracking-[-0.02em] md:text-6xl">
                Ready when <span className="italic text-gradient-gold">you are.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-muted-foreground">
                Point the lens. Choose a filter. Press the golden shutter.
                That is the whole ceremony.
              </p>
              <Link to="/booth" className="mt-10 inline-block">
                <Button size="lg" className="h-12 rounded-full bg-gradient-gold px-8 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground shadow-glow hover:opacity-90">
                  <Camera className="mr-2 h-4 w-4" />Begin the sitting
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/60 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs uppercase tracking-[0.24em] text-muted-foreground md:flex-row">
            <span>Snap &amp; Shine Studio · Maison Numérique</span>
            <span className="text-gold">✦</span>
            <span>© {new Date().getFullYear()} · All frames reserved</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
