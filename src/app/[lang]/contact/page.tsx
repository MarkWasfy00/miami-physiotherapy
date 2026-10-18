import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Clock, Mail, Phone } from "lucide-react";
import { branches, clinic, faqs } from "@/lib/data";
import { getDictionary, href, isLocale, type Locale } from "@/lib/i18n";
import { faqJsonLd, JsonLd, pageAlternates } from "@/lib/seo";
import { BranchCard, FaqList, PageHero } from "@/components/ui/blocks";
import { SocialIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Button asChild className="mt-5 w-full">
          <Link href={href(lang, "/booking")}>{dict.cta.bookNow}</Link>
        </Button>
      ),
    },
    {
      icon: <SocialIcon name="whatsapp" className="size-6" />,
      title: "WhatsApp",
      text: ar ? "رد سريع على استفساراتك" : "Fast replies to your questions",
      action: (
        <Button asChild variant="outline" className="mt-5 w-full">
          <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
            +20 150 101 0194
          </a>
        </Button>
      ),
    },
    {
      icon: <Phone className="size-6" aria-hidden />,
      title: dict.cta.call,
      text: ar ? "الخط الرئيسي للمركز" : "Main clinic line",
      action: (
        <Button asChild variant="outline" className="mt-5 w-full">
          <a href={`tel:${clinic.phone}`} dir="ltr">
            {clinic.phone}
          </a>
        </Button>
      ),
    },
    {
      icon: <Mail className="size-6" aria-hidden />,
      title: dict.common.email,
      text: ar ? "للاستفسارات العامة" : "For general enquiries",
      action: (
        <Button asChild variant="outline" className="mt-5 w-full px-3 text-xs">
          <a href={`mailto:${clinic.email}`}>
            <span className="truncate">{clinic.email}</span>
          </a>
        </Button>
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
        <Badge variant="outline" className="mt-6 h-auto gap-2 border-transparent bg-white px-4 py-2 text-sm font-medium whitespace-normal text-ink shadow-sm">
          <Clock className="size-4! text-lime-600" aria-hidden />
          {dict.common.hours}
        </Badge>
      </PageHero>

      <section className="container-x py-12 sm:py-24">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {channels.map((c) => (
            <Card key={c.title} className="gap-0 p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{c.icon}</span>
              <h2 className="mt-5 text-lg font-bold text-ink">{c.title}</h2>
              <p className="mt-1 flex-1 text-sm text-ink-soft">{c.text}</p>
              {c.action}
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-mist py-12 sm:py-24">
        <div className="container-x">
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">{dict.nav.branches}</h2>
          <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
