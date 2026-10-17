import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";

const intl = createIntlMiddleware(routing);

/** Refreshes the Supabase session cookie and gates /admin. */
async function adminProxy(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next(); // admin shows a setup notice
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLogin = req.nextUrl.pathname.startsWith("/admin/login");
  if (!user && !isLogin) {
    const login = req.nextUrl.clone();
    login.pathname = "/admin/login";
    login.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return res;
}

export default function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) return adminProxy(req);
  return intl(req);
}

export const config = {
  // Skip API, Next internals, metadata routes and files with an extension.
  matcher: ["/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|og-default\\.png|.*\\..*).*)"],
};
