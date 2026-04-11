'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Lock } from 'lucide-react';

// ── Google SVG icon ────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ── Divider ─────────────────────────────────────────────────────────
function Divider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-oracle-border" />
      <span className="text-oracle-muted text-xs font-mono uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-oracle-border" />
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────
function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials'))  return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed'))         return 'Check your inbox for a confirmation link.';
  if (msg.includes('User already registered'))     return 'An account with this email already exists. Try signing in.';
  if (msg.includes('Password should be'))          return 'Password must be at least 8 characters.';
  return msg;
}

// ── Main form ───────────────────────────────────────────────────────
function SignInForm() {
  const router = useRouter();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [oauthLoad, setOauthLoad] = useState(false);
  const [error,     setError]     = useState('');

  const supabase = createClient();

  // ── Email / password sign in ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth ───────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('');
    setOauthLoad(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
    } catch (err: unknown) {
      setError(friendlyError(err instanceof Error ? err.message : 'Google sign-in failed.'));
      setOauthLoad(false);
    }
  };

  return (
    <div className="min-h-screen bg-oracle-base flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="oracle-card w-full max-w-md p-8 animate-fade-up">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-oracle-teal flex items-center justify-center shadow-teal-glow">
            <span className="font-display font-bold text-oracle-base text-lg leading-none select-none">
              O
            </span>
          </div>
          <span className="font-display font-bold text-oracle-bright text-2xl tracking-wide">
            Oracle
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-display font-semibold text-oracle-bright text-2xl text-center mb-1">
          Welcome back to Oracle
        </h1>
        <p className="text-oracle-muted text-sm text-center mb-8 leading-relaxed">
          Sign in to access your life intelligence dashboard
        </p>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={oauthLoad || loading}
          className="oracle-btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {oauthLoad ? (
            <span className="w-4 h-4 border-2 border-oracle-base border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span>{oauthLoad ? 'Redirecting…' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <Divider />

        {/* Email + Password form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="oracle-label block"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-oracle-navy border border-oracle-border text-oracle-bright rounded-xl px-4 py-3 w-full focus:border-oracle-teal outline-none transition-colors duration-150 placeholder:text-oracle-muted text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="oracle-label block"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
                className="bg-oracle-navy border border-oracle-border text-oracle-bright rounded-xl px-4 py-3 pr-11 w-full focus:border-oracle-teal outline-none transition-colors duration-150 placeholder:text-oracle-muted text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-oracle-muted hover:text-oracle-text transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 bg-oracle-crimson/10 border border-oracle-crimson/25 rounded-xl px-4 py-3">
              <Lock size={14} className="text-oracle-crimson mt-0.5 flex-shrink-0" />
              <p className="text-oracle-crimson text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || oauthLoad}
            className="oracle-btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-oracle-base border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-oracle-muted text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            className="text-oracle-teal font-medium hover:text-oracle-bright transition-colors"
          >
            Start for free
          </Link>
        </p>
      </div>

      {/* Footer trust indicators */}
      <p className="mt-6 text-oracle-muted text-xs text-center font-mono tracking-wide">
        End-to-end encrypted · Read-only data access · Delete anytime
      </p>
    </div>
  );
}

// ── Page export (Suspense boundary for useRouter) ──────────────────
export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
