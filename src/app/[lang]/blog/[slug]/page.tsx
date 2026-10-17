import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Clock } from "lucide-react";
import { categories, formatDate, getPost, getPostSlugs, getPosts } from "@/lib/blog";
import { clinic, siteUrl } from "@/lib/data";
import { getDictionary, href, isLocale, locales, t } from "@/lib/i18n";
import { breadcrumbJsonLd, JsonLd, pageAlternates } from "@/lib/seo";
import { BlogCard, CtaBanner } from "@/components/ui/blocks";
import { SocialIcon } from "@/components/ui/icons";

export function generateStaticParams() {
  return locales.flatMap((lang) => getPostSlugs().map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = getPost(slug, lang);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: pageAlternates(lang, `/blog/${slug}`),
    openGraph: { type: "article", publishedTime: post.date, images: [post.image] },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = getPost(slug, lang);
  if (!post) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";
  const related = getPosts(lang)
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);

  return (
    <>
      <article>
        <header className="bg-mist">
          <div className="container-x max-w-4xl py-12 sm:py-16">
            <Link href={href(lang, "/blog")} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
              <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden />
              {dict.common.backToBlog}
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
              {categories[post.category] && (
                <Link
                  href={href(lang, `/blog/category/${post.category}`)}
                  className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  {t(categories[post.category], lang)}
                </Link>
              )}
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
              <span className="flex items-center gap-1">
                <Clock className="size-4" aria-hidden />
                {post.readingMinutes} {dict.common.minRead}
              </span>
            </div>
            <h1 className="mt-5 text-3xl leading-tight font-bold tracking-tight text-balance text-ink sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-lg leading-8 text-ink-soft">{post.description}</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-white p-1.5 shadow-sm">
                <Image src="/logo-mark.png" alt="" width={24} height={30} className="h-7 w-auto" />
              </span>
              <span className="text-sm">
                <span className="block font-semibold text-ink">{ar ? "الفريق الطبي – مركز ميامي" : "Miami Clinic medical team"}</span>
              </span>
            </div>
          </div>
        </header>

        <div className="container-x max-w-6xl">
          <div className="relative -mt-0 aspect-[16/9] overflow-hidden rounded-4xl bg-mist sm:mt-0">
            <Image src={post.image} alt={post.title} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="container-x grid max-w-6xl gap-12 py-12 lg:grid-cols-[1fr_17rem] lg:py-16">
          <div className="prose-article min-w-0" dangerouslySetInnerHTML={{ __html: post.html }} />

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {post.headings.length > 2 && (
              <nav className="hidden rounded-3xl border border-line p-5 lg:block" aria-label={ar ? "محتويات المقال" : "On this page"}>
                <p className="text-sm font-bold text-ink">{ar ? "محتويات المقال" : "On this page"}</p>
                <ol className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
                  {post.headings.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="block leading-5 text-ink-soft hover:text-brand-700">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="rounded-3xl bg-brand-600 p-6 text-white">
              <p className="text-lg font-bold">{ar ? "تحتاج تقييماً لحالتك؟" : "Need your condition assessed?"}</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {ar ? "احجز جلسة تقييم في أقرب فرع لك." : "Book an assessment at your nearest branch."}
              </p>
              <Link href={href(lang, "/booking")} className="btn-lime mt-5 w-full">
                <CalendarCheck className="size-4" aria-hidden />
                {dict.cta.book}
              </Link>
              <a
                href={`https://wa.me/${clinic.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-light mt-2 w-full"
              >
                <SocialIcon name="whatsapp" className="size-4" />
                {dict.cta.whatsapp}
              </a>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-mist py-16 sm:py-20">
          <div className="container-x">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">{dict.common.related}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.slug} post={p} lang={lang} dict={dict} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          headline: post.title,
          description: post.description,
          image: `${siteUrl}${post.image}`,
          datePublished: post.date,
          inLanguage: lang,
          author: { "@id": `${siteUrl}/#organization` },
          publisher: { "@id": `${siteUrl}/#organization` },
          mainEntityOfPage: `${siteUrl}/${lang}/blog/${slug}`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: dict.nav.home, path: `/${lang}` },
          { name: dict.nav.blog, path: `/${lang}/blog` },
          { name: post.title, path: `/${lang}/blog/${slug}` },
        ])}
      />
    </>
  );
}
