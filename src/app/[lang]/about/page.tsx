import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Eye, HeartHandshake, Target } from "lucide-react";
import { approachSteps, stats, team } from "@/lib/data";
import { getDictionary, href, isLocale, t, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { CtaBanner, PageHero, SectionHeading, TeamCard } from "@/components/ui/blocks";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "من نحن" : "About Us",
    description: ar
      ? "تأسس مركز ميامي للعلاج الطبيعي عام 2020 في الإسكندرية، ويقدم اليوم رعاية متخصصة في 5 فروع بالقاهرة والإسكندرية."
      : "Founded in Alexandria in 2020, Miami Physical Therapy Center now provides specialist care across 5 branches in Cairo and Alexandria.",
    alternates: pageAlternates(lang as Locale, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  const pillars = [
    {
      icon: Eye,
      title: ar ? "رؤيتنا" : "Our vision",
      text: ar
        ? "تقديم علاج طبيعي قائم على التقييم الدقيق والمتابعة المستمرة والرعاية الفردية، للوصول بكل مريض إلى أفضل مستوى وظيفي تسمح به حالته."
        : "Physiotherapy grounded in careful assessment, ongoing follow-up and individual care — helping every patient reach the best function their condition allows.",
    },
    {
      icon: Target,
      title: ar ? "مهمتنا" : "Our mission",
      text: ar
        ? "برامج علاجية مصممة لكل حالة تجمع بين التمارين العلاجية والعلاج اليدوي والأجهزة المساعدة، مع تثقيف المريض وقياس التقدم."
        : "Tailored programs combining therapeutic exercise, manual therapy and supporting modalities, with patient education and measured progress.",
    },
    {
      icon: HeartHandshake,
      title: ar ? "قيمنا" : "Our values",
      text: ar
        ? "الاحترام، الشفافية، والصبر. نستمع لكل مريض ونشرح له حالته وخطته بوضوح."
        : "Respect, transparency and patience. We listen to every patient and explain their condition and plan clearly.",
    },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.nav.about }]}
        eyebrow={ar ? "منذ 2020" : "Since 2020"}
        title={ar ? "نؤمن أن كل مريض يستحق خطة علاج خاصة به" : "We believe every patient deserves their own treatment plan"}
        text={
          ar
            ? "بدأ مركز ميامي للعلاج الطبيعي رحلته عام 2020 بأول فرع في الإسكندرية، واليوم نخدم مرضانا من خلال خمسة فروع في الإسكندرية والقاهرة."
            : "Miami Physical Therapy Center opened its first branch in Alexandria in 2020. Today we care for patients across five branches in Alexandria and Cairo."
        }
      />

      <section className="container-x grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-mist">
          <Image
            src="/images/photos/manual-therapy.webp"
            alt={ar ? "جلسة علاج يدوي في مركز ميامي" : "Manual therapy session at Miami Clinic"}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            align="start"
            eyebrow={ar ? "قصتنا" : "Our story"}
            title={ar ? "لا أجهزة ثابتة، ولا تمارين موحدة للجميع" : "No fixed machines. No one-size-fits-all routines."}
          />
          <div className="mt-6 space-y-4 text-lg leading-8 text-ink-soft">
            <p>
              {ar
                ? "يبدأ العلاج عندنا بالاستماع إليك: تاريخك المرضي، أعراضك، وما الذي أصبح صعباً في حياتك اليومية. بعدها نقيّم الحركة والقوة والنشاط، ونحدد معك أهدافاً واضحة."
                : "Treatment starts by listening: your history, your symptoms and what has become difficult in daily life. Then we assess movement, strength and activity, and set clear goals together."}
            </p>
            <p>
              {ar
                ? "نعيد التقييم بشكل دوري ونعدّل الخطة حسب استجابتك، لأن هدفنا ليس عدد الجلسات بل عودتك لحياتك بثقة."
                : "We re-assess regularly and adjust the plan to your response — because our goal isn't the number of sessions, it's getting you back to your life with confidence."}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-white">
        <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-bold text-lime-400" dir="ltr">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-white/70">{t(s.label, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-8">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="size-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold text-ink">{title}</h2>
              <p className="mt-3 leading-7 text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist py-16 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={ar ? "منهجنا" : "Our approach"} title={ar ? "أربع خطوات نحو التعافي" : "Four steps to recovery"} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {approachSteps.map((s, i) => (
              <div key={i} className="card relative p-7">
                <span className="text-5xl font-bold text-brand-100">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-ink">{t(s.title, lang)}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{t(s.text, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16 sm:py-24">
        <SectionHeading
          align="start"
          eyebrow={dict.nav.team}
          title={ar ? "تعرف على الفريق الطبي" : "Meet the clinical team"}
          action={
            <Link href={href(lang, "/team")} className="btn-outline shrink-0">
              {dict.cta.viewAll}
              <ArrowRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <TeamCard key={m.slug} member={m} lang={lang} />
          ))}
        </div>
      </section>

      <CtaBanner lang={lang} dict={dict} />
    </>
  );
}
