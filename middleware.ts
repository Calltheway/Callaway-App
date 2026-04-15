import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require the user to be logged in
const PROTECTED = ['/dashboard', '/chat', '/insights', '/integrations', '/profile'];

export async function middleware(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Skip auth checks when Supabase is not configured (demo mode)
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

  let user = null;
  if (supabaseConfigured) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Auth check failed — treat as unauthenticated
    }
  }

  const path = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes (only when Supabase is live)
  const isProtected = PROTECTED.some((p) => path.startsWith(p));
  if (supabaseConfigured && isProtected && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Redirect authenticated users away from auth/landing pages
  if (supabaseConfigured && path === '/sign-in' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
