import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPath = pathname.startsWith("/login");
  const isPublicPath =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/denied") ||
    pathname === "/favicon.ico";

  if (!user && !isAuthPath && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath && !isAuthPath) {
    // admin_emails check (RLS: admin_emails tablosu anon'a select izni vermeli)
    const { data: adminRow } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();

    if (!adminRow) {
      const url = request.nextUrl.clone();
      url.pathname = "/denied";
      return NextResponse.redirect(url);
    }
  }

  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
