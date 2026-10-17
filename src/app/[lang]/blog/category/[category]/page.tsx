import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/lib/blog";
import { getDictionary, isLocale, locales, t } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { BlogIndex } from "@/components/sections/blog-index";

export function generateStaticParams() {
  return locales.flatMap((lang) => Object.keys(categories).map((category) => ({ lang, category })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/category/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang) || !categories[category]) return {};
  return {
    title: t(categories[category], lang),
    alternates: pageAlternates(lang, `/blog/category/${category}`),
  };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/blog/category/[category]">) {
  const { lang, category } = await params;
  if (!isLocale(lang) || !categories[category]) notFound();
  return <BlogIndex lang={lang} dict={getDictionary(lang)} category={category} />;
}
