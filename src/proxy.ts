import { NextResponse, type NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

/** Redirect locale-less URLs (e.g. "/booking") to their localized version. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const preferred = request.cookies.get("NEXT_LOCALE")?.value;
  const accept = request.headers.get("accept-language") ?? "";
  const locale =
    preferred && locales.includes(preferred)
      ? preferred
      : /^en\b/i.test(accept.trim()) && !/\bar\b/i.test(accept)
        ? "en"
        : defaultLocale;

  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip API routes, Next internals and any file with an extension (images, robots.txt, sitemap.xml…)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
