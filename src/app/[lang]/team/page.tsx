import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, GraduationCap, Trophy } from "lucide-react";
import { team } from "@/lib/data";
import { getDictionary, href, isLocale, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { CtaBanner, PageHero, TeamCard } from "@/components/ui/blocks";

export async function generateMetadata({ params }: PageProps<"/[lang]/team">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "الفريق الطبي" : "Our Clinical Team",
    description: ar
      ? "تعرف على أخصائيي مركز ميامي للعلاج الطبيعي، الحاصلين على شهادات العلاج اليدوي من جامعات بريطانية وشهادات FIFA."
      : "Meet Miami Clinic's physiotherapists, with UK-university manual therapy certificates and FIFA sports-injury qualifications.",
    alternates: pageAlternates(lang as Locale, "/team"),
  };
}

export default async function TeamPage({ params }: PageProps<"/[lang]/team">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  const highlights = [
    { icon: GraduationCap, text: ar ? "شهادات العلاج اليدوي من جامعات بريطانية" : "Manual therapy certificates from UK universities" },
    { icon: Trophy, text: ar ? "شهادات FIFA في الإصابات الرياضية" : "FIFA sports-injury certification" },
    { icon: Award, text: ar ? "خبرة تتجاوز 15 عاماً في العلاج اليدوي" : "15+ years of manual therapy experience" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.nav.team }]}
        eyebrow={dict.nav.team}
        title={ar ? "أيدٍ خبيرة تعتني بتعافيك" : "Expert hands guiding your recovery"}
        text={
          ar
            ? "يقود المركز فريق من الأخصائيين ذوي الخبرة الطويلة، ويدعمهم أكثر من 100 أخصائي وموظف في فروعنا الخمسة."
            : "The center is led by highly experienced specialists, supported by more than 100 therapists and staff across our five branches."
        }
      >
        <ul className="mt-8 flex flex-wrap gap-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm">
              <Icon className="size-4 text-lime-600" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </PageHero>
      <section className="container-x py-16 sm:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <TeamCard key={m.slug} member={m} lang={lang} />
          ))}
        </div>
      </section>
      <CtaBanner lang={lang} dict={dict} />
    </>
  );
}
