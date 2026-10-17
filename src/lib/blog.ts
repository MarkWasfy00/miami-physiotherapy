import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Locale, Localized } from "./i18n";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export const categories: Record<string, Localized> = {
  spine: { ar: "العمود الفقري", en: "Spine" },
  neuro: { ar: "التأهيل العصبي", en: "Neuro rehab" },
  joints: { ar: "المفاصل", en: "Joints" },
  foot: { ar: "القدم والكعب", en: "Foot & heel" },
  clinic: { ar: "عن المركز", en: "About the center" },
};

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image: string;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string; headings: { id: string; text: string }[] };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readPost(slug: string, locale: Locale): Post | null {
  const file = path.join(BLOG_DIR, slug, `${locale}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const words = content.split(/\s+/).length;

  const headings: Post["headings"] = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    const id = slugify(text.replace(/<[^>]+>/g, ""));
    if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, "") });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  const html = marked.parse(content, { renderer, async: false }) as string;

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    category: data.category,
    image: data.image,
    readingMinutes: Math.max(1, Math.round(words / 200)),
    html,
    headings,
  };
}

export function getPostSlugs() {
  return fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function getPost(slug: string, locale: Locale) {
  return readPost(slug, locale);
}

export function getPosts(locale: Locale): PostMeta[] {
  return getPostSlugs()
    .map((slug) => readPost(slug, locale))
    .filter((p): p is Post => p !== null)
    .map(({ slug, title, description, date, category, image, readingMinutes }) => ({
      slug,
      title,
      description,
      date,
      category,
      image,
      readingMinutes,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
