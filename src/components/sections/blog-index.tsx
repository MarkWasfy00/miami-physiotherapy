import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { categories, formatDate, getPosts } from "@/lib/blog";
import { href, t, type Dictionary, type Locale } from "@/lib/i18n";
import { BlogCard, CtaBanner, PageHero } from "@/components/ui/blocks";

export function BlogIndex({ lang, dict, category }: { lang: Locale; dict: Dictionary; category?: string }) {
  const ar = lang === "ar";
  const all = getPosts(lang);
  const posts = category ? all.filter((p) => p.category === category) : all;
  const used = Object.keys(categories).filter((c) => all.some((p) => p.category === c));
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHero
        crumbs={[
          { label: dict.nav.home, href: href(lang) },
          ...(category
            ? [{ label: dict.nav.blog, href: href(lang, "/blog") }, { label: t(categories[category], lang) }]
            : [{ label: dict.nav.blog }]),
        ]}
        eyebrow={dict.nav.blog}
        title={
          category
            ? t(categories[category], lang)
            : ar
              ? "مقالات ونصائح من أخصائيي العلاج الطبيعي"
              : "Articles & advice from our physiotherapists"
        }
        text={
          ar
            ? "معلومات موثوقة تساعدك على فهم حالتك واتخاذ القرار الصحيح، بقلم فريق مركز ميامي الطبي."
            : "Reliable information to help you understand your condition and make the right decisions, from the Miami Clinic medical team."
        }
      />

      <section className="container-x py-12 sm:py-16">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4" aria-label={ar ? "التصنيفات" : "Categories"}>
          <Link
            href={href(lang, "/blog")}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              !category ? "bg-brand-600 text-white" : "bg-mist text-ink hover:bg-brand-50"
            }`}
          >
            {dict.common.allCategories}
          </Link>
          {used.map((c) => (
            <Link
              key={c}
              href={href(lang, `/blog/category/${c}`)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                category === c ? "bg-brand-600 text-white" : "bg-mist text-ink hover:bg-brand-50"
              }`}
            >
              {t(categories[c], lang)}
            </Link>
          ))}
        </nav>

        {featured && (
          <Link
            href={href(lang, `/blog/${featured.slug}`)}
            className="group card mt-10 grid overflow-hidden transition hover:shadow-xl hover:shadow-brand-900/5 lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto lg:min-h-96">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="flex items-center gap-3 text-xs text-ink-soft">
                <span className="rounded-full bg-lime-500/15 px-2.5 py-1 font-semibold text-lime-600">
                  {ar ? "أحدث مقال" : "Latest"}
                </span>
                <span>{formatDate(featured.date, lang)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden />
                  {featured.readingMinutes} {dict.common.minRead}
                </span>
              </div>
              <h2 className="mt-4 text-2xl leading-snug font-bold text-ink group-hover:text-brand-700 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-4 leading-7 text-ink-soft">{featured.description}</p>
              <span className="mt-6 text-sm font-semibold text-brand-700">{dict.cta.readMore} →</span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <BlogCard key={p.slug} post={p} lang={lang} dict={dict} />
            ))}
          </div>
        )}
      </section>
      <CtaBanner lang={lang} dict={dict} />
    </>
  );
}
