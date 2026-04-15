import { type NextRequest, NextResponse } from 'next/server';

// In demo mode (no real Supabase) all app routes are open.
// When Supabase is configured, these routes require auth.
const PROTECTED = ['/dashboard', '/findings', '/invest', '/chat', '/profile', '/issues', '/history', '/settings'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Redirect / to /dashboard for convenience
  if (path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  if (!supabaseConfigured) {
    return NextResponse.next();
  }

  // Real auth check when Supabase is live
  const { createServerClient } = await import('@supabase/ssr');
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch { /* network/config error */ }

  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  if (path === '/sign-in' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
