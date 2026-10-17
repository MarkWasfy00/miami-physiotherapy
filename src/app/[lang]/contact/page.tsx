import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Clock, Mail, Phone } from "lucide-react";
import { branches, clinic, faqs } from "@/lib/data";
import { getDictionary, href, isLocale, type Locale } from "@/lib/i18n";
import { faqJsonLd, JsonLd, pageAlternates } from "@/lib/seo";
import { BranchCard, FaqList, PageHero } from "@/components/ui/blocks";
import { SocialIcon } from "@/components/ui/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "تواصل معنا" : "Contact Us",
    description: ar
      ? "تواصل مع مركز ميامي للعلاج الطبيعي عبر الهاتف أو واتساب أو البريد الإلكتروني، أو احجز موعدك أونلاين."
      : "Contact Miami Physical Therapy Center by phone, WhatsApp or email, or book your appointment online.",
    alternates: pageAlternates(lang as Locale, "/contact"),
  };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  const channels = [
    {
      icon: <CalendarCheck className="size-6" aria-hidden />,
      title: ar ? "احجز أونلاين" : "Book online",
      text: ar ? "اختر الخدمة والفرع والموعد المناسب" : "Pick your service, branch and time",
      action: (
        <Link href={href(lang, "/booking")} className="btn-primary mt-5 w-full">
          {dict.cta.bookNow}
        </Link>
      ),
    },
    {
      icon: <SocialIcon name="whatsapp" className="size-6" />,
      title: "WhatsApp",
      text: ar ? "رد سريع على استفساراتك" : "Fast replies to your questions",
      action: (
        <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5 w-full" dir="ltr">
          +20 150 101 0194
        </a>
      ),
    },
    {
      icon: <Phone className="size-6" aria-hidden />,
      title: dict.cta.call,
      text: ar ? "الخط الرئيسي للمركز" : "Main clinic line",
      action: (
        <a href={`tel:${clinic.phone}`} className="btn-outline mt-5 w-full" dir="ltr">
          {clinic.phone}
        </a>
      ),
    },
    {
      icon: <Mail className="size-6" aria-hidden />,
      title: dict.common.email,
      text: ar ? "للاستفسارات العامة" : "For general enquiries",
      action: (
        <a href={`mailto:${clinic.email}`} className="btn-outline mt-5 w-full !text-xs break-all">
          {clinic.email}
        </a>
      ),
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.nav.contact }]}
        eyebrow={dict.nav.contact}
        title={ar ? "نحن هنا لمساعدتك" : "We're here to help"}
        text={ar ? "تواصل معنا بالطريقة التي تناسبك، وفريقنا جاهز للرد يومياً." : "Reach us however suits you — our team is available every day."}
      >
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
          <Clock className="size-4 text-lime-600" aria-hidden />
          {dict.common.hours}
        </p>
      </PageHero>

      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => (
            <div key={c.title} className="card flex flex-col p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{c.icon}</span>
              <h2 className="mt-5 text-lg font-bold text-ink">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-soft">{c.text}</p>
              {c.action}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-24">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">{dict.nav.branches}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <BranchCard key={b.slug} branch={b} lang={lang} dict={dict} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-ink sm:text-3xl">{dict.common.faq}</h2>
          <FaqList items={faqs} lang={lang} />
        </div>
      </section>
      <JsonLd data={faqJsonLd(lang)} />
    </>
  );
}
