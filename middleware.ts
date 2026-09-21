import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DASHBOARD_PREFIX = "/dashboard";
const SUPER_ADMIN_PREFIX = "/super-admin";
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PREFIX);
  const isSuperAdminRoute = pathname.startsWith(SUPER_ADMIN_PREFIX);
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!user && (isDashboardRoute || isSuperAdminRoute)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const destination = profile?.role === "super_admin" ? SUPER_ADMIN_PREFIX : DASHBOARD_PREFIX;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (user && (isDashboardRoute || isSuperAdminRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (isSuperAdminRoute && profile?.role !== "super_admin") {
      return NextResponse.redirect(new URL(DASHBOARD_PREFIX, request.url));
    }

    if (isDashboardRoute && profile?.role === "super_admin") {
      return NextResponse.redirect(new URL(SUPER_ADMIN_PREFIX, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
