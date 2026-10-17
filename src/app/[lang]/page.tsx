import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, Award, CalendarCheck, Clock, GraduationCap, Quote, ShieldCheck, Trophy } from "lucide-react";
import { approachSteps, branches, cities, clinic, faqs, modalities, services, stats, team, testimonials } from "@/lib/data";
import { getPosts } from "@/lib/blog";
import { getDictionary, href, isLocale, t, type Locale } from "@/lib/i18n";
import { faqJsonLd, JsonLd, pageAlternates } from "@/lib/seo";
import { ModalityIcon, ServiceIcon, SocialIcon } from "@/components/ui/icons";
import { BlogCard, CtaBanner, FaqList, SectionHeading } from "@/components/ui/blocks";
import { BranchGlobe } from "@/components/sections/branch-globe";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: pageAlternates(lang as Locale) };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";
  const posts = getPosts(lang).slice(0, 3);
  const [featuredService, ...otherServices] = services;
  const gridServices = otherServices.slice(0, 4);
  const wideService = otherServices[4];
  const [featuredReview, ...otherReviews] = testimonials;

  return (
    <>
      {/* ============================================================ HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_20%,color-mix(in_oklab,var(--color-brand-200)_60%,transparent),transparent_70%)] rtl:bg-[radial-gradient(50%_60%_at_15%_20%,color-mix(in_oklab,var(--color-brand-200)_60%,transparent),transparent_70%)]"
          aria-hidden
        />
        <div className="container-x relative grid items-center gap-14 pt-12 pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-500 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-lime-500" />
              </span>
              {ar ? "مفتوح يومياً · 5 فروع في القاهرة والإسكندرية" : "Open daily · 5 branches in Cairo & Alexandria"}
            </span>

            <h1 className="mt-7 text-[2.6rem] leading-[1.12] font-bold tracking-tight text-balance text-ink sm:text-6xl lg:text-[4.25rem]">
              {ar ? (
                <>
                  خطوتك الأولى
                  <br />
                  لحركة <span className="relative whitespace-nowrap text-brand-600">أفضل<Underline /></span> تبدأ هنا
                </>
              ) : (
                <>
                  Your first step to <span className="relative whitespace-nowrap text-brand-600">better<Underline /></span>{" "}
                  movement starts here
                </>
              )}
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-pretty text-ink-soft">
              {ar
                ? "علاج طبيعي وتأهيل متخصص يبدأ بتقييم دقيق وخطة مصممة لك، على أيدي أخصائيين معتمدين في العلاج اليدوي من جامعات بريطانية."
                : "Specialist physiotherapy and rehabilitation that starts with a careful assessment and a plan built for you — delivered by UK-certified manual therapists."}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={href(lang, "/booking")} className="btn-primary !px-7 !py-4 text-base">
                <CalendarCheck className="size-5" aria-hidden />
                {dict.cta.bookNow}
              </Link>
              <a
                href={`https://wa.me/${clinic.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline !px-7 !py-4 text-base"
              >
                <SocialIcon name="whatsapp" className="size-5 text-[#25D366]" />
                {dict.cta.whatsapp}
              </a>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {team.map((m) => (
                  <Image
                    key={m.slug}
                    src={m.photo}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full border-[3px] border-white object-cover object-top shadow-sm"
                  />
                ))}
              </div>
              <p className="text-sm leading-5 text-ink-soft">
                <span className="block font-semibold text-ink">
                  {ar ? "فريق طبي بخبرة +15 عاماً" : "A clinical team with 15+ years' experience"}
                </span>
                {ar ? "العلاج اليدوي · العمود الفقري · الإصابات الرياضية" : "Manual therapy · Spine · Sports injuries"}
              </p>
            </div>
          </div>

          {/* Arch image */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-x-6 -top-6 bottom-16 rounded-t-full border-2 border-dashed border-lime-400/60" aria-hidden />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2.5rem] bg-brand-100 shadow-2xl shadow-brand-900/15">
              <Image
                src="/images/photos/rehab-session.webp"
                alt={ar ? "أخصائي علاج طبيعي مع مريض في مركز ميامي" : "Physiotherapist treating a patient at Miami Clinic"}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/50 to-transparent" />
            </div>

            <div className="absolute -start-4 top-1/3 animate-float rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-md sm:-start-10">
              <p className="text-3xl font-bold text-ink" dir="ltr">
                120K<span className="text-lime-500">+</span>
              </p>
              <p className="text-xs font-medium text-ink-soft">{ar ? "مريض تعافى معنا" : "patients treated"}</p>
            </div>
            <div className="absolute -end-3 bottom-24 animate-float rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-md [animation-delay:1.8s] sm:-end-8">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">{ar ? "خطة علاج فردية" : "Individual plan"}</p>
                  <p className="text-xs text-ink-soft">{ar ? "بعد تقييم شامل" : "After full assessment"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick booking */}
        <div className="container-x relative pb-16 lg:pb-20">
          <form
            action={href(lang, "/booking")}
            className="grid gap-3 rounded-[1.75rem] border border-line bg-white p-3 shadow-2xl shadow-brand-900/10 md:grid-cols-[1fr_1fr_auto] md:items-center md:p-3"
          >
            <label className="flex items-center gap-3 rounded-2xl px-4 py-2 hover:bg-mist">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ServiceIcon name="spine" className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold text-ink-soft">{ar ? "الخدمة" : "Service"}</span>
                <select name="service" defaultValue="" className="w-full appearance-none bg-transparent font-semibold text-ink outline-none">
                  <option value="">{ar ? "ما الذي تحتاج علاجه؟" : "What needs treatment?"}</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {t(s.title, lang)}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl px-4 py-2 hover:bg-mist md:border-s md:border-line">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lime-500/15 text-lime-600">
                <Clock className="size-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold text-ink-soft">{ar ? "الفرع" : "Branch"}</span>
                <select name="branch" defaultValue="" className="w-full appearance-none bg-transparent font-semibold text-ink outline-none">
                  <option value="">{ar ? "اختر الفرع الأقرب" : "Choose nearest branch"}</option>
                  {cities.map((c) => (
                    <optgroup key={c.id} label={t(c.name, lang)}>
                      {branches
                        .filter((b) => b.city === c.id)
                        .map((b) => (
                          <option key={b.slug} value={b.slug}>
                            {t(b.name, lang)}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </span>
            </label>
            <button type="submit" className="btn-primary !rounded-2xl !px-8 !py-4">
              {ar ? "اعرض المواعيد المتاحة" : "See available times"}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </button>
          </form>
        </div>
      </section>

      {/* ============================================================ CREDENTIALS + STATS */}
      <section className="border-y border-line bg-white">
        <div className="container-x grid py-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.value} className="border-line px-6 py-4 text-center lg:border-s lg:first:border-s-0">
              <p className="text-4xl font-bold tracking-tight text-ink" dir="ltr">
                {s.value.replace("+", "")}
                {s.value.includes("+") && <span className="text-lime-500">+</span>}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{t(s.label, lang)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-mist/60">
          <div className="container-x flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-5 text-sm font-medium text-ink-soft">
            <span className="flex items-center gap-2">
              <GraduationCap className="size-4 text-brand-600" aria-hidden />
              {ar ? "علاج يدوي معتمد من جامعات بريطانية" : "UK-university certified manual therapy"}
            </span>
            <span className="flex items-center gap-2">
              <Trophy className="size-4 text-brand-600" aria-hidden />
              {ar ? "شهادات FIFA في الإصابات الرياضية" : "FIFA sports-injury certified"}
            </span>
            <span className="flex items-center gap-2">
              <Award className="size-4 text-brand-600" aria-hidden />
              {ar ? "دبلومات رسم العصب والميكانيكا الحيوية" : "EMG & spinal biomechanics diplomas"}
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ SERVICES (bento) */}
      <section className="container-x py-24 sm:py-32">
        <SectionHeading
          align="start"
          eyebrow={dict.nav.services}
          title={ar ? "برامج علاج متخصصة لكل حالة" : "Specialist programs for every condition"}
          text={
            ar
              ? "من آلام الظهر المزمنة إلى التأهيل بعد الجلطات والعمليات — نعالج السبب، وليس العَرَض فقط."
              : "From chronic back pain to rehab after strokes and surgery — we treat the cause, not just the symptom."
          }
          action={
            <Link href={href(lang, "/services")} className="btn-outline shrink-0">
              {dict.cta.viewAll}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          }
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured */}
          <Link
            href={href(lang, `/services/${featuredService.slug}`)}
            className="group relative flex min-h-[28rem] flex-col justify-end overflow-hidden rounded-4xl bg-ink p-8 text-white md:row-span-2"
          >
            <Image
              src={featuredService.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-65"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
            <div className="relative">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-lime-400 text-ink">
                <ServiceIcon name={featuredService.icon} className="size-6" />
              </span>
              <p className="mt-5 text-xs font-semibold tracking-widest text-lime-400 uppercase">
                {ar ? "الأكثر طلباً" : "Most requested"}
              </p>
              <h3 className="mt-2 text-2xl font-bold">{t(featuredService.title, lang)}</h3>
              <p className="mt-3 leading-7 text-white/75">{t(featuredService.short, lang)}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {t(featuredService.conditions, lang)
                  .slice(0, 4)
                  .map((c) => (
                    <span key={c} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                      {c}
                    </span>
                  ))}
              </div>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-lime-400">
                {dict.cta.learnMore}
                <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
              </span>
            </div>
          </Link>

          {gridServices.map((s) => (
            <Link
              key={s.slug}
              href={href(lang, `/services/${s.slug}`)}
              className="group relative flex flex-col overflow-hidden rounded-4xl border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-900/10"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25 transition duration-300 group-hover:scale-110">
                  <ServiceIcon name={s.icon} className="size-6" />
                </span>
                <span className="flex size-10 items-center justify-center rounded-full border border-line text-ink-soft transition group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-ink">{t(s.title, lang)}</h3>
              <p className="mt-2 flex-1 leading-7 text-ink-soft">{t(s.short, lang)}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {t(s.conditions, lang)
                  .slice(0, 3)
                  .map((c) => (
                    <span key={c} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-ink/70">
                      {c}
                    </span>
                  ))}
              </div>
            </Link>
          ))}

          {wideService && (
            <Link
              href={href(lang, `/services/${wideService.slug}`)}
              className="group relative grid overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 to-brand-800 text-white md:col-span-2 lg:col-span-3 lg:grid-cols-[1.2fr_1fr]"
            >
              <div className="relative p-8 sm:p-10">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <ServiceIcon name={wideService.icon} className="size-6" />
                </span>
                <h3 className="mt-6 text-2xl font-bold sm:text-3xl">{t(wideService.title, lang)}</h3>
                <p className="mt-3 max-w-lg leading-7 text-white/80">{t(wideService.intro, lang)}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {t(wideService.conditions, lang).map((c) => (
                    <span key={c} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative hidden min-h-64 lg:block">
                <Image
                  src="/images/photos/manual-therapy.webp"
                  alt=""
                  fill
                  sizes="40vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brand-700/60 to-transparent rtl:bg-gradient-to-l" />
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ============================================================ APPROACH (dark) */}
      <section className="relative overflow-hidden bg-ink py-24 text-white sm:py-32">
        <div className="pointer-events-none absolute -top-48 start-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" aria-hidden />
        <div className="container-x relative">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-lime-400">
              {ar ? "منهجنا في العلاج" : "Our approach"}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              {ar ? "لا أجهزة ثابتة، ولا تمارين موحدة للجميع" : "No fixed machines. No one-size-fits-all routines."}
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/70">
              {ar
                ? "كل خطة علاج عندنا تبدأ منك: تاريخك المرضي، أعراضك، وأهدافك. ثم نقيس التقدم ونعدّل الخطة حتى تصل لأفضل مستوى ممكن."
                : "Every plan starts with you — your history, your symptoms and your goals. Then we measure progress and adjust until you reach your best possible function."}
            </p>
          </div>

          <ol className="relative mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <span className="absolute inset-x-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/25 to-transparent lg:block" aria-hidden />
            {approachSteps.map((step, i) => (
              <li key={i} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
                <span className="relative flex size-16 items-center justify-center rounded-full border border-lime-400/40 bg-ink text-xl font-bold text-lime-400">
                  0{i + 1}
                </span>
                <h3 className="mt-6 text-lg font-bold">{t(step.title, lang)}</h3>
                <p className="mt-2 text-sm leading-7 text-white/65">{t(step.text, lang)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 rounded-4xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-center text-sm font-semibold text-white/60">
              {ar ? "تقنيات علاجية حديثة ضمن خطة متكاملة" : "Modern modalities within a complete plan"}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {modalities.map((m) => (
                <div key={m.icon} className="group flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 transition group-hover:bg-lime-400 group-hover:text-ink">
                    <ModalityIcon name={m.icon} className="size-5" />
                  </span>
                  <span className="text-sm font-semibold">{t(m.title, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ TEAM */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading
            align="start"
            eyebrow={dict.nav.team}
            title={ar ? "أيدٍ خبيرة تعتني بتعافيك" : "Expert hands guiding your recovery"}
            text={
              ar
                ? "يقود المركز أخصائيون بخبرة تتجاوز 15 عاماً، يدعمهم أكثر من 100 أخصائي وموظف."
                : "Led by specialists with 15+ years of experience, supported by more than 100 therapists and staff."
            }
            action={
              <Link href={href(lang, "/team")} className="btn-outline shrink-0">
                {dict.cta.viewAll}
                <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
              </Link>
            }
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <article key={m.slug} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl bg-gradient-to-b from-brand-100 to-white">
                  <Image
                    src={m.photo}
                    alt={t(m.name, lang)}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-3 bottom-3 translate-y-2 rounded-2xl bg-white/90 p-3 opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="space-y-1 text-xs text-ink/80">
                      {t(m.credentials, lang)
                        .slice(0, 3)
                        .map((c) => (
                          <li key={c} className="flex gap-1.5">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lime-500" aria-hidden />
                            {c}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <h3 className="text-lg font-bold text-ink">{t(m.name, lang)}</h3>
                  <p className="mt-0.5 text-sm font-medium text-brand-700">{t(m.role, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ TESTIMONIALS */}
      <section className="container-x py-24 sm:py-32">
        <SectionHeading eyebrow={ar ? "آراء المرضى" : "Patient stories"} title={ar ? "ثقة مرضانا هي أكبر شهادة لنا" : "Our patients say it best"} />
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <figure className="relative flex flex-col justify-between overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white sm:p-12">
            <Quote className="absolute -top-4 end-6 size-40 text-white/10 rtl:-scale-x-100" aria-hidden />
            <blockquote className="relative text-xl leading-9 font-medium sm:text-2xl sm:leading-10">“{t(featuredReview.text, lang)}”</blockquote>
            <figcaption className="relative mt-10 flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-lime-400 text-lg font-bold text-ink">
                {t(featuredReview.name, lang).charAt(0)}
              </span>
              <span>
                <span className="block font-semibold">{t(featuredReview.name, lang)}</span>
                <span className="flex items-center gap-1 text-sm text-white/70">
                  <SocialIcon name="facebook" className="size-3.5" />
                  {ar ? "تقييم على فيسبوك" : "Facebook review"}
                </span>
              </span>
            </figcaption>
          </figure>
          <div className="grid gap-6">
            {otherReviews.map((r, i) => (
              <figure key={i} className="flex flex-col justify-between rounded-4xl border border-line bg-white p-7">
                <blockquote className="leading-8 text-ink/85">“{t(r.text, lang)}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700">
                    {t(r.name, lang).charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{t(r.name, lang)}</span>
                    <span className="flex items-center gap-1 text-xs text-ink-soft">
                      <SocialIcon name="facebook" className="size-3 text-[#1877F2]" />
                      {ar ? "تقييم على فيسبوك" : "Facebook review"}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ BRANCHES MAP */}
      <section className="relative overflow-hidden bg-ink pt-24 pb-20 text-white sm:pt-32">
        <div className="pointer-events-none absolute bottom-0 start-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
        <div className="container-x relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-lime-400">{dict.nav.branches}</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{ar ? "5 فروع قريبة منك" : "5 branches near you"}</h2>
            <p className="mt-4 text-lg text-white/70">
              {ar
                ? "ثلاثة فروع في الإسكندرية وفرعان في القاهرة والجيزة — جميعها مفتوحة يومياً حتى منتصف الليل."
                : "Three branches in Alexandria and two in Cairo & Giza — all open daily until midnight."}
            </p>
          </div>
          <div className="mt-14">
            <BranchGlobe lang={lang} />
          </div>
          <div className="mt-10 text-center">
            <Link href={href(lang, "/branches")} className="btn-ghost-light">
              {ar ? "كل تفاصيل الفروع" : "All branch details"}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ BLOG */}
      <section className="container-x py-24 sm:py-32">
        <SectionHeading
          align="start"
          eyebrow={dict.nav.blog}
          title={ar ? "نصائح ومقالات من أخصائيينا" : "Advice from our specialists"}
          action={
            <Link href={href(lang, "/blog")} className="btn-outline shrink-0">
              {dict.cta.viewAll}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          }
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} lang={lang} dict={dict} />
          ))}
        </div>
      </section>

      {/* ============================================================ FAQ */}
      <section className="bg-mist py-24 sm:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              align="start"
              eyebrow={dict.common.faq}
              title={ar ? "عندك سؤال؟ عندنا الإجابة" : "Questions? We've got answers"}
              text={ar ? "لم تجد إجابة سؤالك؟ تواصل معنا مباشرة." : "Can't find your answer? Reach out directly."}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${clinic.phone}`} className="btn-primary" dir="ltr">
                {clinic.phone}
              </a>
              <a href={`https://wa.me/${clinic.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <SocialIcon name="whatsapp" className="size-4 text-[#25D366]" />
                {dict.cta.whatsapp}
              </a>
            </div>
          </div>
          <FaqList items={faqs} lang={lang} />
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
      <JsonLd data={faqJsonLd(lang)} />
    </>
  );
}

function Underline() {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-3 w-full text-lime-400" aria-hidden>
      <path d="M2 9 C50 3 150 3 198 8" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
