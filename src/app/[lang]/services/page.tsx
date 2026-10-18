import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { modalities, services } from "@/lib/data";
import { getDictionary, href, isLocale, t, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { CtaBanner, PageHero, SectionHeading, ServiceCard } from "@/components/ui/blocks";
import { ModalityIcon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "خدمات العلاج الطبيعي" : "Physiotherapy Services",
    description: ar
      ? "علاج آلام الظهر والرقبة، التأهيل العصبي، خشونة المفاصل، إصابات الكتف، الشوكة العظمية والتأهيل بعد العمليات."
      : "Treatment for back and neck pain, neuro rehab, joint arthritis, shoulder injuries, heel spurs and post-surgical rehab.",
    alternates: pageAlternates(lang as Locale, "/services"),
  };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.nav.services }]}
        eyebrow={dict.nav.services}
        title={ar ? "برامج علاج متخصصة لكل حالة" : "Specialist programs for every condition"}
        text={
          ar
            ? "كل برنامج يبدأ بتقييم شامل، ثم خطة علاج فردية تجمع بين التمارين العلاجية والعلاج اليدوي والأجهزة المساعدة."
            : "Every program begins with a thorough assessment, followed by an individual plan combining therapeutic exercise, manual therapy and supporting modalities."
        }
      />
      <section className="container-x py-12 sm:py-24">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.slug} service={s} lang={lang} dict={dict} />
          ))}
        </div>
      </section>
      <section className="bg-mist py-12 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow={ar ? "التقنيات العلاجية" : "Techniques"}
            title={ar ? "الأجهزة والتقنيات المستخدمة" : "Modalities we use"}
          />
          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-5">
            {modalities.map((m) => (
              <Card key={m.icon} className="gap-0 p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
                  <ModalityIcon name={m.icon} className="size-6" />
                </span>
                <h3 className="mt-5 font-bold text-ink">{t(m.title, lang)}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{t(m.text, lang)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner lang={lang} dict={dict} />
    </>
  );
}
