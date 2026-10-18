"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Clock, MapPin, MousePointer2, Navigation, Phone } from "lucide-react";
import { branches, mapLink, type Branch, type City } from "@/lib/data";
import { href, t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prefersLiteGraphics, whenNearViewport } from "./scene-utils";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const CITIES: { id: City; lat: number; lon: number; side: "left" | "right" }[] = [
  { id: "alexandria", lat: 31.2, lon: 29.92, side: "left" },
  { id: "cairo", lat: 30.04, lon: 31.1, side: "right" },
];

const copy = {
  ar: {
    alexandria: "الإسكندرية",
    cairo: "القاهرة والجيزة",
    branchesCount: (n: number) => (n === 2 ? "فرعان" : `${n} فروع`),
    hintTitle: "5 فروع في مدينتين",
    hint: "مرّر على أي مدينة على الكرة الأرضية لعرض فروعها، أو اسحب لتدوير الكرة.",
    book: "احجز",
    directions: "الاتجاهات",
    hours: "يومياً 10 ص – 12 منتصف الليل",
    drag: "اسحب للتدوير",
  },
  en: {
    alexandria: "Alexandria",
    cairo: "Cairo & Giza",
    branchesCount: (n: number) => `${n} branches`,
    hintTitle: "5 branches in two cities",
    hint: "Hover a city on the globe to see its branches, or drag to spin the Earth.",
    book: "Book",
    directions: "Directions",
    hours: "Daily 10 AM – 12 midnight",
    drag: "Drag to rotate",
  },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function BranchGlobe({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<City, HTMLDivElement | null>>({ alexandria: null, cairo: null });
  const activeRef = useRef<City | null>(null);

  const [activeCity, setActiveCity] = useState<City | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    activeRef.current = activeCity;
  }, [activeCity]);

  useEffect(() => {
    const host = canvasHostRef.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    // three.js and the Earth textures are only fetched when the section is about to scroll into view.
    const stopWatching = whenNearViewport(
      wrap,
      () => {
        if (prefersLiteGraphics().saveData) return setStatus("fallback");
        import("./branch-globe-scene")
          .then(({ mountGlobe }) => {
            if (cancelled) return;
            cleanup = mountGlobe(host, wrap, { cities: CITIES, activeRef, labelRefs, onStatus: setStatus, lite: prefersLiteGraphics().lite });
          })
          .catch(() => !cancelled && setStatus("fallback"));
      },
      "400px",
    );
    return () => {
      cancelled = true;
      stopWatching();
      cleanup?.();
    };
  }, []);

  const cityBranches = (city: City) => branches.filter((b) => b.city === city);
  const panelCity = activeCity;

  return (
    <div ref={wrapRef} className="grid items-center gap-8 lg:grid-cols-[1fr_22rem]">
      {/* Globe */}
      <div className="relative" dir="ltr">
        <div ref={canvasHostRef} className="relative aspect-square w-full cursor-grab active:cursor-grabbing sm:aspect-[5/4]" />

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="size-40 animate-pulse rounded-full bg-gradient-to-br from-brand-600/40 to-brand-900/20 blur-sm" />
          </div>
        )}
        {status === "fallback" && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[2.5rem] border border-white/10 text-white/60">
            <MapPin className="size-10" aria-hidden />
          </div>
        )}

        {/* City labels, positioned every frame from the 3D scene */}
        {CITIES.map((city) => {
          const count = cityBranches(city.id).length;
          const active = activeCity === city.id;
          return (
            <div
              key={city.id}
              ref={(el) => {
                labelRefs.current[city.id] = el;
              }}
              className="absolute top-0 left-0 opacity-0 transition-opacity duration-500 will-change-transform"
            >
              <button
                type="button"
                onMouseEnter={() => setActiveCity(city.id)}
                onFocus={() => setActiveCity(city.id)}
                onClick={() => setActiveCity(city.id)}
                className={`absolute top-0 flex -translate-y-1/2 items-center gap-2 ${
                  city.side === "left" ? "right-0 flex-row-reverse" : "left-0"
                }`}
              >
                <span className={`h-px w-6 sm:w-10 ${active ? "bg-white" : "bg-lime-400/70"}`} />
                <span
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md transition sm:text-sm ${
                    active ? "border-white bg-white text-ink" : "border-white/20 bg-ink/60 text-white hover:border-lime-400"
                  }`}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {c[city.id]}{" "}
                  <span className={cn("hidden min-[440px]:inline", active ? "text-brand-700" : "text-lime-400")}>· {c.branchesCount(count)}</span>
                </span>
              </button>
            </div>
          );
        })}

        <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <MousePointer2 className="size-3.5" aria-hidden />
          {c.drag}
        </span>
      </div>

      {/* Details panel */}
      <div className="no-scrollbar flex flex-col lg:h-[34rem] lg:overflow-y-auto">
        {panelCity ? (
          <div key={panelCity} className="my-auto animate-fade-up space-y-3 py-1 [animation-duration:300ms]">
            <p className="flex items-center gap-2 text-sm font-semibold text-lime-400">
              <MapPin className="size-4" aria-hidden />
              {c[panelCity]}
            </p>
            {cityBranches(panelCity).map((b) => (
              <BranchCard key={b.slug} branch={b} lang={lang} highlighted={activeBranch === b.slug} />
            ))}
          </div>
        ) : (
          <div className="my-auto rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <p className="text-xl font-bold text-white">{c.hintTitle}</p>
            <p className="mt-2 leading-7 text-white/65">{c.hint}</p>
            <div className="mt-6 space-y-2">
              {CITIES.map((city) => (
                <Button
                  key={city.id}
                  variant="glass"
                  onMouseEnter={() => setActiveCity(city.id)}
                  onClick={() => setActiveCity(city.id)}
                  className="h-12 w-full justify-between rounded-2xl border-transparent bg-white/5 px-4 text-start text-base"
                >
                  <span>{c[city.id]}</span>
                  <span className="text-sm font-medium text-lime-400">{c.branchesCount(cityBranches(city.id).length)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Branch chips */}
      <div className="flex flex-wrap justify-center gap-2 lg:col-span-2">
        {branches.map((b) => (
          <Button
            key={b.slug}
            variant="glass"
            size="sm"
            aria-pressed={activeBranch === b.slug}
            onMouseEnter={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            onMouseLeave={() => setActiveBranch(null)}
            onFocus={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            onClick={() => {
              setActiveCity(b.city);
              setActiveBranch(b.slug);
            }}
            className={cn(
              "h-10 text-sm",
              activeBranch === b.slug ? "border-lime-400 bg-lime-400 text-ink hover:bg-lime-400" : "border-white/15 bg-white/5 hover:border-white/40",
            )}
          >
            <MapPin aria-hidden />
            {t(b.name, lang)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function BranchCard({ branch, lang, highlighted }: { branch: Branch; lang: Locale; highlighted: boolean }) {
  const c = copy[lang];
  return (
    <Card className={cn("gap-0 border-0 p-5 text-start shadow-2xl shadow-black/30 transition", highlighted && "ring-4 ring-lime-400")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-ink">{t(branch.name, lang)}</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            {t(branch.address, lang)} — {t(branch.landmark, lang)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {branch.phones.map((p) => (
          <Button key={p} asChild variant="outline" size="sm" className="h-8 border-transparent bg-mist px-3">
            <a href={`tel:${p}`} dir="ltr">
              <Phone className="size-3" aria-hidden />
              {p}
            </a>
          </Button>
        ))}
        <span className="inline-flex items-center gap-1 px-1 text-xs text-ink-soft">
          <Clock className="size-3" aria-hidden />
          {c.hours}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button asChild size="sm" className="h-10 px-3">
          <Link href={`${href(lang, "/booking")}?branch=${branch.slug}`}>
            <CalendarCheck aria-hidden />
            {c.book}
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="h-10 px-3">
          <a href={mapLink(branch.mapQuery)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            {c.directions}
          </a>
        </Button>
      </div>
    </Card>
  );
}
