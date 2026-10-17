export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type Localized<T = string> = Record<Locale, T>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick the string for the active locale from a `{ ar, en }` pair. */
export function t<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

export function localeParams() {
  return locales.map((lang) => ({ lang }));
}

const ui = {
  ar: {
    nav: {
      home: "الرئيسية",
      services: "الخدمات",
      about: "من نحن",
      team: "فريقنا",
      branches: "الفروع",
      blog: "المقالات",
      contact: "تواصل معنا",
    },
    cta: {
      book: "احجز موعدك",
      bookNow: "احجز موعد الآن",
      whatsapp: "تواصل واتساب",
      call: "اتصل بنا",
      learnMore: "اعرف المزيد",
      viewAll: "عرض الكل",
      readMore: "اقرأ المقال",
      directions: "الاتجاهات",
    },
    common: {
      clinicName: "مركز ميامي للعلاج الطبيعي",
      shortName: "ميامي كلينك",
      hours: "يومياً من 10 صباحاً حتى 12 منتصف الليل",
      dailyOpen: "مفتوح يومياً",
      minRead: "دقائق قراءة",
      switchLang: "English",
      menu: "القائمة",
      close: "إغلاق",
      phone: "الهاتف",
      address: "العنوان",
      email: "البريد الإلكتروني",
      workingHours: "مواعيد العمل",
      cairo: "القاهرة",
      alexandria: "الإسكندرية",
      followUs: "تابعنا",
      quickLinks: "روابط سريعة",
      ourServices: "خدماتنا",
      rights: "جميع الحقوق محفوظة.",
      skip: "تخطي إلى المحتوى",
      backToBlog: "كل المقالات",
      related: "مقالات ذات صلة",
      allCategories: "الكل",
      faq: "الأسئلة الشائعة",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      about: "About",
      team: "Our Team",
      branches: "Branches",
      blog: "Blog",
      contact: "Contact",
    },
    cta: {
      book: "Book a visit",
      bookNow: "Book an appointment",
      whatsapp: "WhatsApp us",
      call: "Call us",
      learnMore: "Learn more",
      viewAll: "View all",
      readMore: "Read article",
      directions: "Directions",
    },
    common: {
      clinicName: "Miami Physical Therapy Center",
      shortName: "Miami Clinic",
      hours: "Daily, 10:00 AM – 12:00 midnight",
      dailyOpen: "Open daily",
      minRead: "min read",
      switchLang: "العربية",
      menu: "Menu",
      close: "Close",
      phone: "Phone",
      address: "Address",
      email: "Email",
      workingHours: "Working hours",
      cairo: "Cairo",
      alexandria: "Alexandria",
      followUs: "Follow us",
      quickLinks: "Quick links",
      ourServices: "Our services",
      rights: "All rights reserved.",
      skip: "Skip to content",
      backToBlog: "All articles",
      related: "Related articles",
      allCategories: "All",
      faq: "Frequently asked questions",
    },
  },
};

export type Dictionary = (typeof ui)["ar"];

export function getDictionary(locale: Locale): Dictionary {
  return ui[locale];
}

/** Prefix a site path with the locale: href("en", "/blog") -> "/en/blog". */
export function href(locale: Locale, path = "/") {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
