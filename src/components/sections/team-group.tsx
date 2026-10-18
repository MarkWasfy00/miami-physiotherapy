"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { Award, Trophy } from "lucide-react";
import type { TeamMember } from "@/lib/data";
import { t, type Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

/** Hover previews are for mice only: on touch a tap would fire enter + click and cancel itself out. */
const onMouse = (fn: () => void) => (e: PointerEvent) => {
  if (e.pointerType === "mouse") fn();
};

const copy = {
  ar: { years: "خبرة +15 عاماً", fifa: "معتمدون من FIFA", hint: "اختر أخصائياً للتعرف عليه" },
  en: { years: "15+ years' experience", fifa: "FIFA certified", hint: "Pick a specialist to meet them" },
};

/** The four lead therapists composed into one animated group portrait. */
export function TeamGroup({ members, lang }: { members: TeamMember[]; lang: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const c = copy[lang];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Entrance plays once; the looping animations pause whenever the section is off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = active === null ? null : members[active];

  return (
    <div
      ref={ref}
      className="team-group"
      data-in-view={inView || undefined}
      data-paused={!visible || undefined}
      data-active={active !== null || undefined}
    >
      <div
        className="relative overflow-hidden rounded-4xl bg-gradient-to-b from-brand-100 via-brand-50 to-white"
        onPointerLeave={onMouse(() => setActive(null))}
      >
        {/* Backdrop: glow + slowly turning dashed rings */}
        <div className="team-group-glow pointer-events-none absolute inset-0" aria-hidden />
        <svg className="team-group-rings pointer-events-none absolute left-1/2 top-[8%] w-[80%] -translate-x-1/2" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="var(--color-lime-400)" strokeOpacity=".55" strokeWidth=".6" strokeDasharray="2 5" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="var(--color-brand-300)" strokeOpacity=".6" strokeWidth=".6" strokeDasharray="1 4" />
        </svg>

        <div className="team-group-stage relative">
          {members.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              className="team-group-person"
              style={{ "--i": i } as CSSProperties}
              data-on={active === i || undefined}
              aria-pressed={active === i}
              aria-label={t(m.name, lang)}
              onPointerEnter={onMouse(() => setActive(i))}
              onFocus={() => setActive(i)}
              onClick={() => setActive((a) => (a === i ? null : i))}
            >
              <span className="team-group-photo">
                <Image
                  src={m.photo}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 26vw, 40vw"
                  className="object-cover object-top"
                />
              </span>
            </button>
          ))}
        </div>

        {/* Light sweep across the whole picture */}
        <div className="team-group-sheen pointer-events-none absolute inset-0" aria-hidden />

        {/* Floating badges */}
        <div className="team-group-badge absolute start-3 top-4 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md sm:start-6 sm:top-6">
          <Award className="size-4 text-brand-600" aria-hidden />
          <span className="text-xs font-semibold text-ink">{c.years}</span>
        </div>
        <div className="team-group-badge absolute end-3 top-4 flex items-center gap-2 rounded-2xl border border-white/60 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md [--d:1.1s] sm:end-6 sm:top-6">
          <Trophy className="size-4 text-lime-600" aria-hidden />
          <span className="text-xs font-semibold text-ink">{c.fifa}</span>
        </div>
      </div>

      {/* Names, doubling as controls for the spotlight */}
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {members.map((m, i) => (
          <li key={m.slug}>
            <button
              type="button"
              className="team-group-name min-h-16 w-full touch-manipulation rounded-2xl border px-3 py-3 text-center transition duration-300 sm:px-4"
              style={{ "--i": i } as CSSProperties}
              data-on={active === i || undefined}
              onPointerEnter={onMouse(() => setActive(i))}
              onPointerLeave={onMouse(() => setActive(null))}
              onFocus={() => setActive(i)}
              onClick={() => setActive((a) => (a === i ? null : i))}
            >
              <span className="block text-sm font-bold text-ink sm:text-base">{t(m.name, lang)}</span>
              <span className="mt-0.5 block text-sm font-medium text-brand-700">{t(m.role, lang)}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Credentials of the spotlighted doctor */}
      <div className="mt-4 min-h-14" aria-live="polite">
        {current ? (
          <ul key={current.slug} className="flex animate-fade-up flex-wrap justify-center gap-2">
            {t(current.credentials, lang).map((cr) => (
              <li key={cr}>
                <Badge variant="outline" className="h-auto min-h-7 border-transparent bg-white px-3.5 py-1.5 font-medium whitespace-normal text-ink shadow-sm">
                  <span className="size-1.5 shrink-0 rounded-full bg-lime-500" aria-hidden />
                  {cr}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-ink-soft">{c.hint}</p>
        )}
      </div>
    </div>
  );
}
