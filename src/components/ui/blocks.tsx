import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Clock, MapPin, Navigation, Phone, Quote } from "lucide-react";
import { clinic, mapLink, type Branch, type Service, type TeamMember } from "@/lib/data";
import { categories, formatDate, type PostMeta } from "@/lib/blog";
import { href, t, type Dictionary, type Locale, type Localized } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Avatar, AvatarFallback } from "./avatar";
import { Badge } from "./badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { ServiceIcon, SocialIcon } from "./icons";

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Badge variant="soft" className={cn("h-7 px-3 tracking-wide", className)}>
      {children}
    </Badge>
  );
}

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
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
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
      {/* Gradients instead of blurred blobs: same glow, no large blur paint on mobile */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_28rem_at_100%_0%,color-mix(in_oklab,var(--color-brand-200)_55%,transparent),transparent_70%),radial-gradient(32rem_24rem_at_0%_100%,color-mix(in_oklab,var(--color-lime-400)_18%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className="container-x relative py-12 sm:py-20">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {crumbs.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {c.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={c.href} className="hover:text-brand-700">
                        {c.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="line-clamp-1">{c.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {eyebrow && <Eyebrow className="bg-white">{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-3xl text-[2rem] leading-tight font-bold tracking-tight text-balance text-ink sm:text-5xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-base leading-7 text-pretty text-ink-soft sm:text-lg sm:leading-8">{text}</p>}
        {children}
      </div>
    </section>
  );
}

const hoverLift = "transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5";

export function ServiceCard({ service, lang, dict }: { service: Service; lang: Locale; dict: Dictionary }) {
  return (
    <Card className={cn("group relative gap-0 py-0", hoverLift)}>
      <Link href={href(lang, `/services/${service.slug}`)} className="flex h-full flex-col">
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
        <CardHeader className="pt-6">
          <CardTitle>{t(service.title, lang)}</CardTitle>
          <CardDescription className="leading-6">{t(service.short, lang)}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-5 pb-6">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
            {dict.cta.learnMore}
            <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}

export function TeamCard({ member, lang }: { member: TeamMember; lang: Locale }) {
  return (
    <Card className="group gap-0 py-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-brand-50 to-mist">
        <Image
          src={member.photo}
          alt={t(member.name, lang)}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition duration-500 group-hover:scale-105"
        />
      </div>
      <CardHeader className="pt-5">
        <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{t(member.role, lang)}</p>
        <CardTitle>{t(member.name, lang)}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-5">
        <ul className="space-y-1.5 text-sm text-ink-soft">
          {t(member.credentials, lang).map((c) => (
            <li key={c} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-lime-500" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ReviewAuthor({
  name,
  lang,
  tone = "light",
}: {
  name: Localized;
  lang: Locale;
  tone?: "light" | "brand" | "dark";
}) {
  return (
    <figcaption className="flex items-center gap-3">
      <Avatar size="lg" className={tone === "dark" ? "size-12" : undefined}>
        <AvatarFallback
          className={cn(
            "font-bold",
            tone === "light" && "bg-brand-50 text-brand-700",
            tone === "brand" && "bg-brand-600 text-white",
            tone === "dark" && "bg-lime-400 text-lg text-ink",
          )}
        >
          {t(name, lang).charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span>
        <span className={cn("block font-semibold", tone === "dark" ? "text-white" : "text-sm text-ink")}>{t(name, lang)}</span>
        <span className={cn("flex items-center gap-1", tone === "dark" ? "text-sm text-white/70" : "text-xs text-ink-soft")}>
          <SocialIcon name="facebook" className={tone === "dark" ? "size-3.5" : "size-3 text-[#1877F2]"} />
          {lang === "ar" ? "تقييم على فيسبوك" : "Facebook review"}
        </span>
      </span>
    </figcaption>
  );
}

export function TestimonialCard({ name, text, lang }: { name: Localized; text: Localized; lang: Locale }) {
  return (
    <Card className="h-full p-7">
      <figure className="flex h-full flex-col gap-4">
        <Quote className="size-8 text-lime-500 rtl:-scale-x-100" aria-hidden />
        <blockquote className="flex-1 text-[15px] leading-7 text-ink/85">“{t(text, lang)}”</blockquote>
        <div className="mt-2 border-t pt-5">
          <ReviewAuthor name={name} lang={lang} tone="brand" />
        </div>
      </figure>
    </Card>
  );
}

export function BlogCard({ post, lang, dict }: { post: PostMeta; lang: Locale; dict: Dictionary }) {
  return (
    <Card className={cn("group gap-0 py-0", hoverLift)}>
      <Link href={href(lang, `/blog/${post.slug}`)} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-mist">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <CardHeader className="pt-6">
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            {categories[post.category] && <Badge variant="soft">{t(categories[post.category], lang)}</Badge>}
            <span>{formatDate(post.date, lang)}</span>
          </div>
          <CardTitle className="mt-2 group-hover:text-brand-700">{post.title}</CardTitle>
          <CardDescription className="line-clamp-2 leading-6">{post.description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-4 pb-6">
          <span className="flex items-center gap-1.5 text-xs text-ink-soft">
            <Clock className="size-3.5" aria-hidden />
            {post.readingMinutes} {dict.common.minRead}
          </span>
        </CardContent>
      </Link>
    </Card>
  );
}

export function BranchCard({ branch, lang, dict }: { branch: Branch; lang: Locale; dict: Dictionary }) {
  return (
    <Card className="h-full gap-4 transition hover:border-brand-200 hover:shadow-lg hover:shadow-brand-900/5">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-semibold tracking-wide text-lime-600 uppercase">
            {branch.city === "cairo" ? dict.common.cairo : dict.common.alexandria}
          </p>
          <CardTitle className="mt-1">
            <Link href={href(lang, `/branches/${branch.slug}`)} className="hover:text-brand-700">
              {t(branch.name, lang)}
            </Link>
          </CardTitle>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <MapPin className="size-5" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-ink/80">
          {t(branch.address, lang)}
          <span className="block text-ink-soft">{t(branch.landmark, lang)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {branch.phones.map((p) => (
            <Button key={p} asChild variant="outline" size="sm" className="border-transparent bg-mist">
              <a href={`tel:${p}`} dir="ltr">
                <Phone className="size-3" aria-hidden />
                {p}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto gap-2 border-0 bg-transparent pt-2">
        <Button asChild className="flex-1">
          <Link href={`${href(lang, "/booking")}?branch=${branch.slug}`}>
            <CalendarCheck aria-hidden />
            {dict.cta.book}
          </Link>
        </Button>
        <Button asChild variant="outline" className="px-4" aria-label={dict.cta.directions}>
          <a href={mapLink(branch.mapQuery)} target="_blank" rel="noopener noreferrer">
            <Navigation aria-hidden />
            <span className="hidden sm:inline">{dict.cta.directions}</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function FaqList({ items, lang }: { items: { q: Localized; a: Localized }[]; lang: Locale }) {
  return (
    <Accordion type="single" collapsible defaultValue="0" className="rounded-3xl border bg-white">
      {items.map((f, i) => (
        <AccordionItem key={i} value={String(i)} className="px-5 sm:px-6">
          <AccordionTrigger className="py-5 text-base font-semibold text-ink hover:no-underline hover:text-brand-700">
            {t(f.q, lang)}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-base leading-7 text-ink-soft">{t(f.a, lang)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function CtaBanner({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-4xl bg-brand-600 px-6 py-12 text-white sm:px-14 sm:py-14">
        <div className="pointer-events-none absolute -end-20 -top-20 size-80 rounded-full bg-white/10" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-32 end-40 size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-lime-400)_45%,transparent),transparent)]"
          aria-hidden
        />
        <Image
          src="/logo-mark.png"
          alt=""
          width={304}
          height={379}
          className="pointer-events-none absolute -bottom-10 end-6 hidden w-56 opacity-15 brightness-0 invert lg:block"
        />
        <div className="relative max-w-2xl">
          <h2 className="text-[1.75rem] leading-tight font-bold tracking-tight text-balance sm:text-4xl">
            {lang === "ar" ? "خطوتك الأولى لحركة أفضل تبدأ هنا" : "Your first step to better movement starts here"}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            {lang === "ar"
              ? "احجز جلسة التقييم في أقرب فرع لك خلال أقل من دقيقة، وسيتواصل معك فريقنا لتأكيد الموعد."
              : "Book your assessment at the nearest branch in under a minute — our team will call you to confirm."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild variant="secondary">
              <Link href={href(lang, "/booking")}>
                <CalendarCheck aria-hidden />
                {dict.cta.bookNow}
              </Link>
            </Button>
            <Button asChild variant="glass">
              <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <SocialIcon name="whatsapp" className="size-4" />
                {dict.cta.whatsapp}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
