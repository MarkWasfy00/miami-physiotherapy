import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { BlogIndex } from "@/components/sections/blog-index";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "مقالات العلاج الطبيعي" : "Physiotherapy Blog",
    description: ar
      ? "مقالات ونصائح عن الانزلاق الغضروفي، التأهيل بعد الجلطة، خشونة الركبة، الشوكة العظمية وغيرها."
      : "Articles and advice on disc herniation, stroke rehab, knee arthritis, heel spurs and more.",
    alternates: pageAlternates(lang as Locale, "/blog"),
  };
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <BlogIndex lang={lang} dict={getDictionary(lang)} />;
}
