import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Check, Clock, Phone } from "lucide-react";
import { clinic, faqs, getService, services } from "@/lib/data";
import { getDictionary, href, isLocale, locales, t } from "@/lib/i18n";
import { breadcrumbJsonLd, JsonLd, pageAlternates } from "@/lib/seo";
import { CtaBanner, FaqList, PageHero, ServiceCard } from "@/components/ui/blocks";
import { ServiceIcon, SocialIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function generateStaticParams() {
  return locales.flatMap((lang) => services.map((s) => ({ lang, slug: s.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!service || !isLocale(lang)) return {};
  return {
    title: t(service.title, lang),
    description: t(service.short, lang),
    alternates: pageAlternates(lang, `/services/${slug}`),
    openGraph: { images: [service.image] },
  };
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!service || !isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";
  const title = t(service.title, lang);
  const others = services.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[
          { label: dict.nav.home, href: href(lang) },
          { label: dict.nav.services, href: href(lang, "/services") },
          { label: title },
        ]}
        title={title}
        text={t(service.short, lang)}
      >
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
          <Button asChild>
            <Link href={`${href(lang, "/booking")}?service=${service.slug}`}>
              <CalendarCheck aria-hidden />
              {dict.cta.bookNow}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${clinic.phone}`} dir="ltr">
              <Phone aria-hidden />
              {clinic.phone}
            </a>
          </Button>
        </div>
      </PageHero>

      <section className="container-x grid gap-10 py-10 sm:gap-12 sm:py-24 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-mist sm:rounded-4xl">
            <Image src={service.image} alt={title} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>

          <p className="mt-8 text-base leading-8 text-ink/85 sm:mt-10 sm:text-lg">{t(service.intro, lang)}</p>

          <h2 className="mt-12 text-2xl font-bold text-ink">{ar ? "الحالات التي نعالجها" : "Conditions we treat"}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {t(service.conditions, lang).map((c) => (
              <li key={c} className="flex items-center gap-3 rounded-2xl border border-line p-4 font-medium text-ink">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-lime-500/15 text-lime-600">
                  <Check className="size-4" aria-hidden />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl font-bold text-ink">{ar ? "كيف يسير العلاج؟" : "What to expect"}</h2>
          <ol className="mt-6 space-y-4">
            {t(service.approach, lang).map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">
                  {i + 1}
                </span>
                <p className="pt-2 leading-7 text-ink/85">{step}</p>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 text-2xl font-bold text-ink">{ar ? "التقنيات المستخدمة" : "Techniques used"}</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {t(service.techniques, lang).map((x) => (
              <Badge key={x} variant="soft" className="h-9 px-4 text-sm">
                {x}
              </Badge>
            ))}
          </div>

          <div className="mt-12 flex gap-4 rounded-3xl bg-mist p-6">
            <Clock className="size-6 shrink-0 text-brand-600" aria-hidden />
            <div>
              <p className="font-bold text-ink">{ar ? "كم جلسة سأحتاج؟" : "How many sessions will I need?"}</p>
              <p className="mt-1 leading-7 text-ink-soft">{t(service.sessions, lang)}</p>
            </div>
          </div>

          <h2 className="mt-12 mb-6 text-2xl font-bold text-ink">{dict.common.faq}</h2>
          <FaqList items={faqs.slice(0, 4)} lang={lang} />
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-4xl bg-ink p-6 text-white sm:p-7">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-lime-400">
              <ServiceIcon name={service.icon} className="size-6" />
            </span>
            <p className="mt-5 text-xl font-bold">{ar ? "ابدأ رحلة التعافي اليوم" : "Start your recovery today"}</p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              {ar
                ? "احجز جلسة تقييم وسنضع لك خطة علاج واضحة."
                : "Book an assessment and we'll build you a clear treatment plan."}
            </p>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link href={`${href(lang, "/booking")}?service=${service.slug}`}>
                <CalendarCheck aria-hidden />
                {dict.cta.bookNow}
              </Link>
            </Button>
            <Button asChild variant="glass" className="mt-3 w-full">
              <a href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">
                <SocialIcon name="whatsapp" className="size-4" />
                {dict.cta.whatsapp}
              </a>
            </Button>
            <p className="mt-6 border-t border-white/10 pt-5 text-xs text-white/60">{dict.common.hours}</p>
          </div>
        </aside>
      </section>

      <section className="bg-mist py-12 sm:py-24">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">{ar ? "خدمات أخرى" : "Other services"}</h2>
          <div className="mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => (
              <ServiceCard key={s.slug} service={s} lang={lang} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: `/${lang}` },
          { name: dict.nav.services, path: `/${lang}/services` },
          { name: title, path: `/${lang}/services/${slug}` },
        ])}
      />
    </>
  );
}
