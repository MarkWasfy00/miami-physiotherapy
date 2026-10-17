import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import { branches, cities, clinic, services } from "@/lib/data";
import { href, t, type Dictionary, type Locale } from "@/lib/i18n";
import { SocialIcon } from "@/components/ui/icons";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = 2026;
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <Link href={href(lang)} className="inline-flex items-center gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white p-2">
              <Image src="/logo-mark.png" alt="" width={34} height={42} className="h-10 w-auto" />
            </span>
            <span className="text-lg font-bold text-white">{dict.common.clinicName}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7">
            {lang === "ar"
              ? "رعاية متخصصة في العلاج الطبيعي والتأهيل منذ 2020، بخمسة فروع قريبة منك في القاهرة والإسكندرية."
              : "Specialist physiotherapy and rehabilitation since 2020, with five branches near you in Cairo and Alexandria."}
          </p>
          <div className="mt-6 flex gap-2">
            {(["facebook", "instagram", "youtube"] as const).map((s) => (
              <a
                key={s}
                href={clinic.social[s]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s}
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-600"
              >
                <SocialIcon name={s} className="size-4" />
              </a>
            ))}
            <a
              href={`https://wa.me/${clinic.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#25D366]"
            >
              <SocialIcon name="whatsapp" className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{dict.common.ourServices}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={href(lang, `/services/${s.slug}`)} className="transition hover:text-white">
                  {t(s.title, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{dict.common.quickLinks}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {(["about", "team", "branches", "blog", "contact"] as const).map((item) => (
              <li key={item}>
                <Link href={href(lang, `/${item}`)} className="transition hover:text-white">
                  {dict.nav[item]}
                </Link>
              </li>
            ))}
            <li>
              <Link href={href(lang, "/booking")} className="font-semibold text-lime-400 transition hover:text-lime-500">
                {dict.cta.bookNow}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white">{dict.nav.branches}</h3>
          <div className="mt-5 space-y-4 text-sm">
            {cities.map((city) => (
              <div key={city.id}>
                <p className="font-medium text-white/90">{t(city.name, lang)}</p>
                <p className="mt-1">
                  {branches
                    .filter((b) => b.city === city.id)
                    .map((b, i, arr) => (
                      <span key={b.slug}>
                        <Link href={href(lang, `/branches/${b.slug}`)} className="transition hover:text-white">
                          {t(b.name, lang)}
                        </Link>
                        {i < arr.length - 1 && " · "}
                      </span>
                    ))}
                </p>
              </div>
            ))}
            <ul className="space-y-2 pt-2">
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-lime-400" aria-hidden />
                <a href={`tel:${clinic.phone}`} dir="ltr" className="hover:text-white">
                  {clinic.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-lime-400" aria-hidden />
                <a href={`mailto:${clinic.email}`} className="break-all hover:text-white">
                  {clinic.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-lime-400" aria-hidden />
                {dict.common.hours}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>
            © {year} {dict.common.clinicName}. {dict.common.rights}
          </p>
          <p className="text-white/50">
            {lang === "ar"
              ? "المعلومات على هذا الموقع للتوعية ولا تغني عن الاستشارة الطبية."
              : "Information on this site is for awareness and does not replace medical advice."}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab({ lang }: { lang: Locale }) {
  const msg = lang === "ar" ? "مرحباً، أريد الاستفسار عن حجز جلسة علاج طبيعي" : "Hello, I'd like to ask about booking a physiotherapy session";
  return (
    <a
      href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(msg)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" aria-hidden />
      <SocialIcon name="whatsapp" className="relative size-7" />
    </a>
  );
}
