"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Globe, Menu, Phone, X } from "lucide-react";
import { clinic } from "@/lib/data";
import { href, type Dictionary, type Locale } from "@/lib/i18n";

type Props = { lang: Locale; dict: Dictionary };

const navItems = ["services", "about", "team", "branches", "blog", "contact"] as const;

export function Header(props: Props) {
  const pathname = usePathname();
  return <HeaderView {...props} pathname={pathname} />;
}

/** Static header used as the Suspense fallback before the pathname is known. */
export function HeaderView({ lang, dict, pathname }: Props & { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const otherLang: Locale = lang === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${otherLang}`) || `/${otherLang}`;
  const isActive = (item: string) => pathname.startsWith(href(lang, `/${item}`));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-line/80 bg-white/85 shadow-sm backdrop-blur-xl" : "bg-white"
      }`}
    >
      <div className="container-x flex h-18 items-center justify-between gap-4">
        <Link href={href(lang)} className="flex shrink-0 items-center gap-2.5" aria-label={dict.common.clinicName}>
          <Image src="/logo-mark.png" alt="" width={34} height={42} priority className="h-10 w-auto" />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold text-ink">
              Miami<span className="text-lime-500">Clinic</span>
            </span>
            <span className="block text-[11px] font-medium text-ink-soft">
              {lang === "ar" ? "للعلاج الطبيعي والتأهيل" : "Physical Therapy Center"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item}
              href={href(lang, `/${item}`)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                isActive(item) ? "bg-brand-50 text-brand-700" : "text-ink/75 hover:text-brand-700"
              }`}
            >
              {dict.nav[item]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={switchHref}
            hrefLang={otherLang}
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/75 transition hover:text-brand-700 sm:inline-flex"
          >
            <Globe className="size-4" aria-hidden />
            {dict.common.switchLang}
          </Link>
          <a
            href={`tel:${clinic.phone}`}
            className="hidden size-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-brand-300 hover:text-brand-700 md:inline-flex xl:hidden"
            aria-label={dict.cta.call}
          >
            <Phone className="size-4" />
          </a>
          <a
            href={`tel:${clinic.phone}`}
            className="hidden items-center gap-2 px-2 text-sm font-semibold text-ink xl:inline-flex"
            dir="ltr"
          >
            <Phone className="size-4 text-brand-600" aria-hidden />
            {clinic.phone}
          </a>
          <Link href={href(lang, "/booking")} className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            <CalendarCheck className="size-4" aria-hidden />
            {dict.cta.book}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-line lg:hidden"
            aria-label={dict.common.menu}
            aria-expanded={open}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 end-0 flex w-[min(22rem,88vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
          }`}
        >
          <div className="flex h-18 items-center justify-between border-b border-line px-5">
            <span className="font-bold">{dict.common.shortName}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-line"
              aria-label={dict.common.close}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Mobile">
            {(["home", ...navItems] as const).map((item) => (
              <Link
                key={item}
                href={item === "home" ? href(lang) : href(lang, `/${item}`)}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-base font-medium ${
                  item !== "home" && isActive(item) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-mist"
                }`}
              >
                {dict.nav[item]}
              </Link>
            ))}
            <Link
              href={switchHref}
              hrefLang={otherLang}
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-medium text-ink hover:bg-mist"
            >
              <Globe className="size-4" aria-hidden />
              {dict.common.switchLang}
            </Link>
          </nav>
          <div className="space-y-2 border-t border-line p-4">
            <Link href={href(lang, "/booking")} onClick={() => setOpen(false)} className="btn-primary w-full">
              <CalendarCheck className="size-4" aria-hidden />
              {dict.cta.bookNow}
            </Link>
            <a href={`tel:${clinic.phone}`} className="btn-outline w-full" dir="ltr">
              <Phone className="size-4" aria-hidden />
              {clinic.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
