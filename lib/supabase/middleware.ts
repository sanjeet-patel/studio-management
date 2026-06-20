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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public paths that don't require auth
  const publicPaths = ["/login", "/register", "/admin/login", "/auth/callback", "/admin/(auth)", "/~offline"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    if (pathname.startsWith("/admin")) {
      loginUrl.pathname = "/admin/login";
    } else {
      loginUrl.pathname = "/login";
    }
    return NextResponse.redirect(loginUrl);
  }

  // Get user role for route protection
  if (user) {
    const { data: userProfile } = await supabase
      .from("users")
      .select("role, tenant_id")
      .eq("id", user.id)
      .single();

    // Admin routes require admin role
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      if (!userProfile || userProfile.role !== "admin") {
        return NextResponse.redirect(new URL("/studio/dashboard", request.url));
      }
    }

    // Studio routes require studio role + tenant
    if (pathname.startsWith("/studio")) {
      if (!userProfile || userProfile.role !== "studio" || !userProfile.tenant_id) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Redirect root
    if (pathname === "/") {
      if (userProfile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/studio/dashboard", request.url));
      }
    }
  }

  return supabaseResponse;
}
