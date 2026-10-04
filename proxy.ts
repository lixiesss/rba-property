import { NextResponse, type NextRequest } from "next/server";
import { adminLocaleCookie, defaultLocale, isLocale, localeCookie } from "@/lib/i18n/config";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/^\/(admin|auth)(\/|$)/.test(path)) {
    const preference = request.cookies.get(adminLocaleCookie)?.value;
    request.headers.set("x-rba-locale", isLocale(preference) ? preference : defaultLocale);
    return hasSupabaseEnv() ? updateSession(request) : NextResponse.next({ request });
  }
  const segment = path.split("/")[1];
  if (isLocale(segment)) {
    request.headers.set("x-rba-locale", segment);
    return NextResponse.next({ request });
  }
  if (path === "/" || /^\/(properties|about|faq|contact)(\/|$)/.test(path)) {
    const preference = request.cookies.get(localeCookie)?.value;
    const url = request.nextUrl.clone();
    url.pathname = `/${isLocale(preference) ? preference : defaultLocale}${path === "/" ? "" : path}`;
    return NextResponse.redirect(url);
  }
  request.headers.set("x-rba-locale", defaultLocale);
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico|robots.txt|sitemap.xml).*)"],
};
