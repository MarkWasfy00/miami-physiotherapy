import { createElement } from "react";
import type { Metadata } from "next";
import { branches, clinic, faqs, siteUrl, type Branch } from "./data";
import { locales, t, type Locale } from "./i18n";

/** Canonical + hreflang alternates for a locale-agnostic path like "/blog". */
export function pageAlternates(lang: Locale, path = ""): Metadata["alternates"] {
  return {
    canonical: `/${lang}${path}`,
    languages: Object.fromEntries([
      ...locales.map((l) => [l === "ar" ? "ar-EG" : "en", `/${l}${path}`]),
      ["x-default", `/ar${path}`],
    ]),
  };
}

export function JsonLd({ data }: { data: object }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}

function branchJsonLd(b: Branch, lang: Locale) {
  return {
    "@type": ["MedicalClinic", "Physiotherapy"],
    "@id": `${siteUrl}/#branch-${b.slug}`,
    name: `${lang === "ar" ? "مركز ميامي للعلاج الطبيعي" : "Miami Physical Therapy Center"} – ${t(b.name, lang)}`,
    url: `${siteUrl}/${lang}/branches/${b.slug}`,
    telephone: b.phones.map((p) => `+2${p}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: t(b.address, lang),
      addressLocality: b.city === "cairo" ? (lang === "ar" ? "الجيزة" : "Giza") : lang === "ar" ? "الإسكندرية" : "Alexandria",
      addressCountry: "EG",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "10:00",
      closes: "23:59",
    },
    medicalSpecialty: "PhysicalTherapy",
  };
}

export function organizationJsonLd(lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": `${siteUrl}/#organization`,
    name: lang === "ar" ? "مركز ميامي للعلاج الطبيعي" : "Miami Physical Therapy Center",
    alternateName: "Miami Clinic",
    url: `${siteUrl}/${lang}`,
    logo: `${siteUrl}/logo.png`,
    foundingDate: String(clinic.founded),
    telephone: `+2${clinic.phone}`,
    email: clinic.email,
    sameAs: Object.values(clinic.social),
    medicalSpecialty: "PhysicalTherapy",
    department: branches.map((b) => branchJsonLd(b, lang)),
  };
}

export function singleBranchJsonLd(b: Branch, lang: Locale) {
  return { "@context": "https://schema.org", ...branchJsonLd(b, lang), parentOrganization: { "@id": `${siteUrl}/#organization` } };
}

export function faqJsonLd(lang: Locale, items = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: t(f.q, lang),
      acceptedAnswer: { "@type": "Answer", text: t(f.a, lang) },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
