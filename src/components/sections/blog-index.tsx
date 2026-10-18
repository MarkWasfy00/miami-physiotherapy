import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { categories, formatDate, getPosts } from "@/lib/blog";
import { href, t, type Dictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BlogCard, CtaBanner, PageHero } from "@/components/ui/blocks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

      <section className="container-x py-10 sm:py-16">
        <nav
          className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0"
          aria-label={ar ? "التصنيفات" : "Categories"}
        >
          {[{ key: "", href: href(lang, "/blog"), label: dict.common.allCategories }, ...used.map((c) => ({ key: c, href: href(lang, `/blog/category/${c}`), label: t(categories[c], lang) }))].map(
            (item) => {
              const active = (category ?? "") === item.key;
              return (
                <Button
                  key={item.key || "all"}
                  asChild
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className={cn("h-10 snap-start px-4 text-sm shadow-none", !active && "border-transparent bg-mist hover:bg-brand-50")}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    {item.label}
                  </Link>
                </Button>
              );
            },
          )}
        </nav>

        {featured && (
          <Card className="group mt-8 gap-0 py-0 transition hover:shadow-xl hover:shadow-brand-900/5 sm:mt-10">
            <Link href={href(lang, `/blog/${featured.slug}`)} className="grid lg:grid-cols-2">
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
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-soft">
                  <Badge variant="lime">{ar ? "أحدث مقال" : "Latest"}</Badge>
                  <span>{formatDate(featured.date, lang)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {featured.readingMinutes} {dict.common.minRead}
                  </span>
                </div>
                <h2 className="mt-4 text-xl leading-snug font-bold text-ink group-hover:text-brand-700 sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 leading-7 text-ink-soft">{featured.description}</p>
                <span className="mt-6 text-sm font-semibold text-brand-700">
                  {dict.cta.readMore} <span className="inline-block rtl:-scale-x-100">→</span>
                </span>
              </div>
            </Link>
          </Card>
        )}

        {rest.length > 0 && (
          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
