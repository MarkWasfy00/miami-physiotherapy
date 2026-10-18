"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Hand } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { prefersLiteGraphics, whenNearViewport } from "./scene-utils";

const copy = {
  ar: { tap: "المس العمود الفقري" },
  en: { tap: "Tap the spine" },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function HeroSpine({ lang, fallback }: { lang: Locale; fallback: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (prefersLiteGraphics().saveData) {
      queueMicrotask(() => setStatus("fallback"));
      return;
    }
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    // three.js lives in its own chunk, fetched only once the hero is (nearly) on screen.
    const stopWatching = whenNearViewport(host, () => {
      import("./hero-spine-scene")
        .then(({ mountSpine }) => {
          if (!cancelled) cleanup = mountSpine(host, setStatus, prefersLiteGraphics().lite);
        })
        .catch(() => !cancelled && setStatus("fallback"));
    });
    return () => {
      cancelled = true;
      stopWatching();
      cleanup?.();
    };
  }, []);

  if (status === "fallback") return <>{fallback}</>;

  return (
    <div className="relative aspect-[4/5] w-full" dir="ltr">
      {/* Soft halo behind the spine */}
      <div
        className="pointer-events-none absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-brand-200)_75%,transparent),color-mix(in_oklab,var(--color-brand-100)_40%,transparent)_60%,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-lime-400/50"
        aria-hidden
      />
      <div
        ref={hostRef}
        className={`absolute inset-0 cursor-pointer transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        role="img"
        aria-label={lang === "ar" ? "عمود فقري ثلاثي الأبعاد متحرك" : "Animated 3D spine"}
      />
      <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-medium text-ink-soft shadow-sm backdrop-blur">
        <Hand className="size-3.5 text-brand-600" aria-hidden />
        {copy[lang].tap}
      </span>
    </div>
  );
}
