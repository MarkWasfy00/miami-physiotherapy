import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { Footer, WhatsAppFab } from "@/components/layout/footer";
import { Header, HeaderView } from "@/components/layout/header";
import { JsonLd, organizationJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/data";
import { dir, getDictionary, isLocale, localeParams } from "@/lib/i18n";
import "../globals.css";

const arabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

const latin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: ar
        ? "مركز ميامي للعلاج الطبيعي | علاج طبيعي وتأهيل في القاهرة والإسكندرية"
        : "Miami Physical Therapy Center | Physiotherapy in Cairo & Alexandria",
      template: ar ? "%s | مركز ميامي للعلاج الطبيعي" : "%s | Miami Physical Therapy Center",
    },
    description: ar
      ? "مركز ميامي للعلاج الطبيعي والتأهيل: علاج الانزلاق الغضروفي وخشونة الركبة وآلام الكتف والتأهيل العصبي وبعد العمليات. 5 فروع في الإسكندرية والقاهرة. احجز موعدك أونلاين."
      : "Miami Physical Therapy Center: treatment for disc herniation, knee arthritis, shoulder pain, neuro and post-surgical rehab. 5 branches in Alexandria and Cairo. Book online.",
    applicationName: "Miami Clinic",
    openGraph: {
      type: "website",
      siteName: ar ? "مركز ميامي للعلاج الطبيعي" : "Miami Physical Therapy Center",
      locale: ar ? "ar_EG" : "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0f83e9",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <html
      lang={lang}
      dir={dir(lang)}
      className={`${arabic.variable} ${latin.variable}`}
      style={{ ["--font-body" as string]: lang === "ar" ? "var(--font-arabic)" : "var(--font-latin)" }}
    >
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-brand-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        >
          {dict.common.skip}
        </a>
        <Suspense fallback={<HeaderView lang={lang} dict={dict} pathname={`/${lang}`} />}>
          <Header lang={lang} dict={dict} />
        </Suspense>
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} dict={dict} />
        <WhatsAppFab lang={lang} />
        <JsonLd data={organizationJsonLd(lang)} />
      </body>
    </html>
  );
}
