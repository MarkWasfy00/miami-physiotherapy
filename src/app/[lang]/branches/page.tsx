import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { branches, cities } from "@/lib/data";
import { getDictionary, href, isLocale, t, type Locale } from "@/lib/i18n";
import { pageAlternates } from "@/lib/seo";
import { BranchCard, CtaBanner, PageHero } from "@/components/ui/blocks";

export async function generateMetadata({ params }: PageProps<"/[lang]/branches">): Promise<Metadata> {
  const { lang } = await params;
  const ar = lang === "ar";
  return {
    title: ar ? "فروعنا في القاهرة والإسكندرية" : "Our Branches in Cairo & Alexandria",
    description: ar
      ? "فروع مركز ميامي للعلاج الطبيعي: ميامي، كامب شيزار، محرم بك، الدقي والشيخ زايد. العناوين وأرقام الهاتف ومواعيد العمل."
      : "Miami Clinic branches: Miami, Camp Shezar, Moharam Bek, Dokki and Sheikh Zayed. Addresses, phone numbers and opening hours.",
    alternates: pageAlternates(lang as Locale, "/branches"),
  };
}

export default async function BranchesPage({ params }: PageProps<"/[lang]/branches">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const ar = lang === "ar";

  return (
    <>
      <PageHero
        crumbs={[{ label: dict.nav.home, href: href(lang) }, { label: dict.nav.branches }]}
        eyebrow={dict.nav.branches}
        title={ar ? "فرع قريب منك أينما كنت" : "A branch close to you"}
        text={`${ar ? "خمسة فروع في الإسكندرية والقاهرة." : "Five branches across Alexandria and Cairo."} ${dict.common.hours}.`}
      />
      {cities.map((city) => (
        <section key={city.id} className="container-x py-12 first-of-type:pt-16 sm:py-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-ink">
            <span className="h-8 w-1.5 rounded-full bg-lime-500" aria-hidden />
            {t(city.name, lang)}
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches
              .filter((b) => b.city === city.id)
              .map((b) => (
                <BranchCard key={b.slug} branch={b} lang={lang} dict={dict} />
              ))}
          </div>
        </section>
      ))}
      <CtaBanner lang={lang} dict={dict} />
    </>
  );
}
