import type { MetadataRoute } from "next";
import { branches, services, siteUrl } from "@/lib/data";
import { categories, getPostSlugs } from "@/lib/blog";
import { locales } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/services",
    "/about",
    "/team",
    "/branches",
    "/blog",
    "/booking",
    "/contact",
    ...services.map((s) => `/services/${s.slug}`),
    ...branches.map((b) => `/branches/${b.slug}`),
    ...Object.keys(categories).map((c) => `/blog/category/${c}`),
    ...getPostSlugs().map((s) => `/blog/${s}`),
  ];
  return paths.map((path) => ({
    url: `${siteUrl}/ar${path}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])) },
    priority: path === "" ? 1 : path === "/booking" ? 0.9 : 0.7,
  }));
}
