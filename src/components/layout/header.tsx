"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Globe, Menu, Phone } from "lucide-react";
import { clinic } from "@/lib/data";
import { href, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type Props = { lang: Locale; dict: Dictionary };

const navItems = ["services", "about", "team", "branches", "blog", "contact"] as const;

export function Header(props: Props) {
  const pathname = usePathname();
  return <HeaderView {...props} pathname={pathname} />;
}

/** Static header used as the Suspense fallback before the pathname is known. */
export function HeaderView({ lang, dict, pathname }: Props & { pathname: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const otherLang: Locale = lang === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${otherLang}`) || `/${otherLang}`;
  const isActive = (item: string) => pathname.startsWith(href(lang, `/${item}`));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled ? "border-b border-line/80 bg-white/90 shadow-sm backdrop-blur-lg" : "bg-white",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3 sm:h-18">
        <Link href={href(lang)} className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label={dict.common.clinicName}>
          <Image src="/logo-mark.png" alt="" width={34} height={42} priority className="h-9 w-auto sm:h-10" />
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
            <Button
              key={item}
              asChild
              variant="ghost"
              size="sm"
              className={cn("text-sm font-medium", isActive(item) && "bg-brand-50 text-brand-700")}
            >
              <Link href={href(lang, `/${item}`)} aria-current={isActive(item) ? "page" : undefined}>
                {dict.nav[item]}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-sm font-medium sm:inline-flex">
            <Link href={switchHref} hrefLang={otherLang}>
              <Globe aria-hidden />
              {dict.common.switchLang}
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="hidden md:inline-flex xl:hidden" aria-label={dict.cta.call}>
            <a href={`tel:${clinic.phone}`}>
              <Phone />
            </a>
          </Button>
          <Button asChild variant="ghost" className="hidden px-2 text-ink xl:inline-flex">
            <a href={`tel:${clinic.phone}`} dir="ltr">
              <Phone className="text-brand-600" aria-hidden />
              {clinic.phone}
            </a>
          </Button>
          <Button asChild className="hidden h-10 px-5 sm:inline-flex">
            <Link href={href(lang, "/booking")}>
              <CalendarCheck aria-hidden />
              {dict.cta.book}
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label={dict.common.menu}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={lang === "ar" ? "left" : "right"}
              className="w-[min(22rem,88vw)] gap-0 p-0 [&>[data-slot=sheet-close]]:top-4 [&>[data-slot=sheet-close]]:end-4 [&>[data-slot=sheet-close]]:size-10"
            >
              <SheetHeader className="h-18 justify-center border-b px-5">
                <SheetTitle className="font-bold">{dict.common.shortName}</SheetTitle>
                <SheetDescription className="sr-only">{dict.common.menu}</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-4" aria-label="Mobile">
                {(["home", ...navItems] as const).map((item) => {
                  const active = item !== "home" && isActive(item);
                  return (
                    <SheetClose key={item} asChild>
                      <Link
                        href={item === "home" ? href(lang) : href(lang, `/${item}`)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center rounded-2xl px-4 text-base font-medium transition-colors",
                          active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-mist",
                        )}
                      >
                        {dict.nav[item]}
                      </Link>
                    </SheetClose>
                  );
                })}
                <Separator className="my-2" />
                <SheetClose asChild>
                  <Link
                    href={switchHref}
                    hrefLang={otherLang}
                    className="flex min-h-12 items-center gap-2 rounded-2xl px-4 text-base font-medium text-ink hover:bg-mist"
                  >
                    <Globe className="size-4" aria-hidden />
                    {dict.common.switchLang}
                  </Link>
                </SheetClose>
              </nav>
              <SheetFooter className="border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href={href(lang, "/booking")}>
                      <CalendarCheck aria-hidden />
                      {dict.cta.bookNow}
                    </Link>
                  </Button>
                </SheetClose>
                <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${clinic.phone}`} dir="ltr">
                    <Phone aria-hidden />
                    {clinic.phone}
                  </a>
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
