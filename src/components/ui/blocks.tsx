import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, ChevronDown, Clock, MapPin, Navigation, Phone, Quote } from "lucide-react";
import { clinic, mapLink, type Branch, type Service, type TeamMember } from "@/lib/data";
import { categories, formatDate, type PostMeta } from "@/lib/blog";
import { href, t, type Dictionary, type Locale, type Localized } from "@/lib/i18n";
import { ServiceIcon, SocialIcon } from "./icons";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "center",
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "center" | "start";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-6 ${
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance text-ink sm:text-4xl">{title}</h2>
        {text && <p className="mt-4 text-base leading-7 text-pretty text-ink-soft sm:text-lg">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  crumbs: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div className="pointer-events-none absolute -top-40 end-[-10%] size-[32rem] rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 start-[-10%] size-[28rem] rounded-full bg-lime-400/20 blur-3xl" aria-hidden />
      <div className="container-x relative py-14 sm:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
          <ol className="flex flex-wrap items-center gap-1.5">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-brand-700">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <span className="eyebrow bg-white">{eyebrow}</span>}
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance text-ink sm:text-5xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg leading-8 text-pretty text-ink-soft">{text}</p>}
        {children}
      </div>
    </section>
  );
}

export function ServiceCard({ service, lang, dict }: { service: Service; lang: Locale; dict: Dictionary }) {
  return (
    <Link
      href={href(lang, `/services/${service.slug}`)}
      className="group card relative flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <Image
          src={service.image}
          alt={t(service.title, lang)}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
        <span className="absolute bottom-4 start-4 flex size-11 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-lg">
          <ServiceIcon name={service.icon} className="size-5" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-ink">{t(service.title, lang)}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{t(service.short, lang)}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          {dict.cta.learnMore}
          <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
        </span>
      </div>
    </Link>
  );
}

export function TeamCard({ member, lang }: { member: TeamMember; lang: Locale }) {
  return (
    <article className="group card overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-brand-50 to-mist">
        <Image
          src={member.photo}
          alt={t(member.name, lang)}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{t(member.role, lang)}</p>
        <h3 className="mt-1 text-lg font-bold text-ink">{t(member.name, lang)}</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
          {t(member.credentials, lang).map((c) => (
            <li key={c} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime-500" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function TestimonialCard({ name, text, lang }: { name: Localized; text: Localized; lang: Locale }) {
  return (
    <figure className="card flex h-full flex-col p-7">
      <Quote className="size-8 text-lime-500 rtl:-scale-x-100" aria-hidden />
      <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink/85">“{t(text, lang)}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
          {t(name, lang).charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">{t(name, lang)}</span>
          <span className="flex items-center gap-1 text-xs text-ink-soft">
            <SocialIcon name="facebook" className="size-3 text-[#1877F2]" />
            {lang === "ar" ? "تقييم على فيسبوك" : "Facebook review"}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function BlogCard({ post, lang, dict }: { post: PostMeta; lang: Locale; dict: Dictionary }) {
  return (
    <Link
      href={href(lang, `/blog/${post.slug}`)}
      className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/5"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          {categories[post.category] && (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
              {t(categories[post.category], lang)}
            </span>
          )}
          <span>{formatDate(post.date, lang)}</span>
        </div>
        <h3 className="mt-3 text-lg leading-snug font-bold text-ink group-hover:text-brand-700">{post.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-ink-soft">{post.description}</p>
        <span className="mt-4 flex items-center gap-1.5 text-xs text-ink-soft">
          <Clock className="size-3.5" aria-hidden />
          {post.readingMinutes} {dict.common.minRead}
        </span>
      </div>
    </Link>
  );
}

export function BranchCard({ branch, lang, dict }: { branch: Branch; lang: Locale; dict: Dictionary }) {
  return (
    <article className="card flex h-full flex-col p-6 transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-lime-600 uppercase">
            {branch.city === "cairo" ? dict.common.cairo : dict.common.alexandria}
          </p>
          <h3 className="mt-1 text-lg font-bold text-ink">
            <Link href={href(lang, `/branches/${branch.slug}`)} className="hover:text-brand-700">
              {t(branch.name, lang)}
            </Link>
          </h3>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <MapPin className="size-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink/80">
        {t(branch.address, lang)}
        <span className="block text-ink-soft">{t(branch.landmark, lang)}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {branch.phones.map((p) => (
          <a
            key={p}
            href={`tel:${p}`}
            dir="ltr"
            className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-brand-50 hover:text-brand-700"
          >
            <Phone className="size-3" aria-hidden />
            {p}
          </a>
        ))}
      </div>
      <div className="mt-auto flex gap-2 pt-6">
        <Link href={`${href(lang, "/booking")}?branch=${branch.slug}`} className="btn-primary flex-1 !px-4 !py-2.5">
          <CalendarCheck className="size-4" aria-hidden />
          {dict.cta.book}
        </Link>
        <a
          href={mapLink(branch.mapQuery)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline !px-4 !py-2.5"
          aria-label={dict.cta.directions}
        >
          <Navigation className="size-4" aria-hidden />
          <span className="hidden sm:inline">{dict.cta.directions}</span>
        </a>
      </div>
    </article>
  );
}

export function FaqList({ items, lang }: { items: { q: Localized; a: Localized }[]; lang: Locale }) {
  return (
    <div className="divide-y divide-line rounded-3xl border border-line bg-white">
      {items.map((f, i) => (
        <details key={i} className="group px-6 [&_summary::-webkit-details-marker]:hidden" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-start font-semibold text-ink">
            {t(f.q, lang)}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist transition group-open:rotate-180 group-open:bg-brand-600 group-open:text-white">
              <ChevronDown className="size-4" aria-hidden />
            </span>
          </summary>
          <p className="pb-5 leading-7 text-ink-soft">{t(f.a, lang)}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBanner({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-4xl bg-brand-600 px-6 py-14 text-white sm:px-14">
        <div className="pointer-events-none absolute -end-20 -top-20 size-80 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 end-40 size-72 rounded-full bg-lime-400/30 blur-2xl" aria-hidden />
        <Image
          src="/logo-mark.png"
          alt=""
          width={304}
          height={379}
          className="pointer-events-none absolute -bottom-10 end-6 hidden w-56 opacity-15 brightness-0 invert lg:block"
        />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {lang === "ar" ? "خطوتك الأولى لحركة أفضل تبدأ هنا" : "Your first step to better movement starts here"}
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/80">
            {lang === "ar"
              ? "احجز جلسة التقييم في أقرب فرع لك خلال أقل من دقيقة، وسيتواصل معك فريقنا لتأكيد الموعد."
              : "Book your assessment at the nearest branch in under a minute — our team will call you to confirm."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href(lang, "/booking")} className="btn-lime">
              <CalendarCheck className="size-4" aria-hidden />
              {dict.cta.bookNow}
            </Link>
            <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
              <SocialIcon name="whatsapp" className="size-4" />
              {dict.cta.whatsapp}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
