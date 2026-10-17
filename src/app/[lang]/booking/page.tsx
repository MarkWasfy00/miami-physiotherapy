import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { getDictionary, href, isLocale, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { PageHero } from "@/components/ui/blocks";
import { BookingForm } from "./booking-form";

export async function generateMetadata({ params }: PageProps<"/[lang]/booking">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "احجز موعدك" : "Book an Appointment",
    description: ar
      ? "احجز جلسة علاج طبيعي أونلاين في أي من فروع مركز ميامي بالقاهرة والإسكندرية خلال أقل من دقيقة."
      : "Book a physiotherapy session online at any Miami Clinic branch in Cairo or Alexandria in under a minute.",
    alternates: pageAlternates(lang as Locale, "/booking"),
  };
}

export default async function BookingPage({ params }: PageProps<"/[lang]/booking">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.cta.bookNow }]}
        eyebrow={ar ? "حجز أونلاين" : "Online booking"}
        title={ar ? "احجز موعدك في 4 خطوات بسيطة" : "Book your visit in 4 simple steps"}
        text={
          ar
            ? "اختر الخدمة والفرع والموعد المناسب، وسيتواصل معك فريقنا لتأكيد الحجز."
            : "Choose your service, branch and time — our team will contact you to confirm."
        }
      >
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-soft">
          <ShieldCheck className="size-4 text-lime-600" aria-hidden />
          {ar ? "بياناتك آمنة ولن تُستخدم إلا لتأكيد موعدك." : "Your details are only used to confirm your appointment."}
        </p>
      </PageHero>
      <section className="container-x py-12 sm:py-16">
        <Suspense
          fallback={
            <div className="flex min-h-96 items-center justify-center rounded-4xl border border-line">
              <Loader2 className="size-8 animate-spin text-brand-600" aria-label="Loading" />
            </div>
          }
        >
          <BookingForm lang={lang} />
        </Suspense>
      </section>
    </>
  );
}
