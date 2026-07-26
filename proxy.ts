import { NextResponse, type NextRequest } from "next/server";
import { isLocale, LOCALE_COOKIE, locales, matchLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  // An explicit choice from the language switcher wins over the browser header.
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    preferred && isLocale(preferred)
      ? preferred
      : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, and anything that looks like a static file.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.[\\w]+$).*)"],
};
