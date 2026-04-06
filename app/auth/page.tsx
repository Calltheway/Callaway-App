'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useUnhookedStore } from '@/store/useUnhookedStore';
import { Mail, ArrowRight, Zap, Shield, Brain } from 'lucide-react';

export default function AuthPage() {
  const router  = useRouter();
  const store   = useUnhookedStore();
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowser();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGuestMode() {
    store.setUserProfile({
      userName:          'Guest',
      sobrietyStartDate: new Date().toISOString(),
      onboardingComplete: false,
    });
    router.push('/onboarding');
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <Mail className="text-[#00D4FF]" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Check your email</h1>
          <p className="text-gray-400 mb-2">
            We sent a magic link to <span className="text-[#00D4FF] font-semibold">{email}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">Click the link to sign in. It expires in 1 hour.</p>
          <button
            onClick={() => setSent(false)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6">
      {/* Hero */}
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#00D4FF]/5 border border-[#00D4FF]/30 flex items-center justify-center">
            <span className="text-3xl font-black text-[#00D4FF]">U</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Unhooked</h1>
          <p className="text-gray-400 text-lg">Break free. Rewire your brain.</p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: <Brain size={12} />, label: 'Brainwave Entrainment' },
            { icon: <Zap size={12} />,   label: 'AI Recovery Coach' },
            { icon: <Shield size={12} />, label: 'Science-backed' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-[#111827] border border-[#1E2A3A] rounded-full px-3 py-1.5 text-xs text-gray-300">
              <span className="text-[#00D4FF]">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Auth form */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-1">Start your journey</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your email for a secure magic link</p>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#0A0E1A] border border-[#1E2A3A] rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] text-[#0A0E1A] font-bold py-3 rounded-xl hover:bg-[#00B8E0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-[#0A0E1A] border-t-transparent rounded-full" />
              ) : (
                <>
                  Send magic link <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E2A3A]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#111827] px-3 text-xs text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGuestMode}
            className="w-full py-3 border border-[#1E2A3A] rounded-xl text-gray-400 hover:text-white hover:border-gray-500 transition-all text-sm font-medium"
          >
            Continue as guest (demo mode)
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Not a substitute for professional medical advice.{' '}
          <br />
          Consult a doctor before use if you have a medical condition.
        </p>
      </div>
    </div>
  );
}
