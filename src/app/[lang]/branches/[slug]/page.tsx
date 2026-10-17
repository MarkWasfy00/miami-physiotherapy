import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { branches, mapEmbedUrl, mapLink, services } from "@/lib/data";
import { getDictionary, href, isLocale, locales, t } from "@/lib/i18n";
import { breadcrumbJsonLd, JsonLd, pageAlternates, singleBranchJsonLd } from "@/lib/seo";
import { BranchCard, CtaBanner, PageHero } from "@/components/ui/blocks";
import { ServiceIcon } from "@/components/ui/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => branches.map((b) => ({ lang, slug: b.slug })));
}

const getBranch = (slug: string) => branches.find((b) => b.slug === slug);

export async function generateMetadata({ params }: PageProps<"/[lang]/branches/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const branch = getBranch(slug);
  if (!branch || !isLocale(lang)) return {};
  const ar = lang === "ar";
  return {
    title: ar ? `علاج طبيعي ${t(branch.name, lang)}` : `Physiotherapy – ${t(branch.name, lang)}`,
    description: `${t(branch.address, lang)}، ${t(branch.landmark, lang)}. ${branch.phones.join(" / ")}`,
    alternates: pageAlternates(lang, `/branches/${slug}`),
  };
}

export default async function BranchPage({ params }: PageProps<"/[lang]/branches/[slug]">) {
  const { lang, slug } = await params;
  const branch = getBranch(slug);
  if (!branch || !isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";
  const name = t(branch.name, lang);
  const nearby = branches.filter((b) => b.slug !== slug && b.city === branch.city);

  return (
    <>
      <PageHero
        crumbs={[
          { label: dict.nav.home, href: href(lang) },
          { label: dict.nav.branches, href: href(lang, "/branches") },
          { label: name },
        ]}
        eyebrow={branch.city === "cairo" ? dict.common.cairo : dict.common.alexandria}
        title={`${dict.common.clinicName} – ${name}`}
        text={`${t(branch.address, lang)} · ${t(branch.landmark, lang)}`}
      />

      <section className="container-x grid gap-8 py-16 sm:py-24 lg:grid-cols-[1fr_24rem]">
        <div className="overflow-hidden rounded-4xl border border-line bg-mist">
          <iframe
            title={name}
            src={mapEmbedUrl(branch.mapQuery)}
            className="aspect-[4/3] h-full min-h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="space-y-4">
          <div className="card space-y-5 p-6">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">{dict.common.address}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {t(branch.address, lang)}
                  <br />
                  {t(branch.landmark, lang)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">{dict.common.phone}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {branch.phones.map((p) => (
                    <a key={p} href={`tel:${p}`} dir="ltr" className="text-sm font-medium text-brand-700 hover:underline">
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-ink">{dict.common.workingHours}</p>
                <p className="mt-1 text-sm text-ink-soft">{dict.common.hours}</p>
              </div>
            </div>
          </div>
          <Link href={`${href(lang, "/booking")}?branch=${branch.slug}`} className="btn-primary w-full !py-3.5">
            <CalendarCheck className="size-4" aria-hidden />
            {ar ? `احجز في ${name}` : `Book at ${name}`}
          </Link>
          <a href={mapLink(branch.mapQuery)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full !py-3.5">
            <Navigation className="size-4" aria-hidden />
            {dict.cta.directions}
          </a>
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-20">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-ink">
            {ar ? `الخدمات المتاحة في ${name}` : `Services available at ${name}`}
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={href(lang, `/services/${s.slug}`)}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 font-semibold text-ink transition hover:border-brand-200 hover:text-brand-700"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                {t(s.title, lang)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {nearby.length > 0 && (
        <section className="container-x py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-ink">{ar ? "فروع أخرى قريبة" : "Other branches nearby"}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nearby.map((b) => (
              <BranchCard key={b.slug} branch={b} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      )}

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd data={singleBranchJsonLd(branch, lang)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: `/${lang}` },
          { name: dict.nav.branches, path: `/${lang}/branches` },
          { name, path: `/${lang}/branches/${slug}` },
        ])}
      />
    </>
  );
}
