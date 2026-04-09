'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useDopamindStore } from '@/store/useDopamindStore';
import { Mail, ArrowRight, Brain, Shield, Zap, CheckCircle } from 'lucide-react';

const VALUE_PROPS = [
  {
    icon: Brain,
    label: 'Brain Rewiring Tech',
    desc: 'Binaural beats + visual entrainment for real neural change',
    color: 'from-violet-600 to-violet-400',
    glow: 'rgba(124,58,237,0.4)',
  },
  {
    icon: Shield,
    label: 'App Blocker',
    desc: 'Block triggers and temptation at the device level',
    color: 'from-cyan-600 to-cyan-400',
    glow: 'rgba(0,212,255,0.4)',
  },
  {
    icon: Zap,
    label: 'AI Recovery Coach',
    desc: 'Science-backed guidance available 24/7 in your pocket',
    color: 'from-amber-500 to-orange-400',
    glow: 'rgba(245,158,11,0.4)',
  },
];

export default function AuthPage() {
  const router  = useRouter();
  const store   = useDopamindStore();
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
      userName:          'Warrior',
      sobrietyStartDate: new Date().toISOString(),
      onboardingComplete: false,
    });
    router.push('/onboarding');
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-md w-full text-center relative z-10 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-cyan-400/10 border border-cyan-400/30 flex items-center justify-center"
            style={{ boxShadow: '0 0 30px rgba(0,212,255,0.2)' }}>
            <Mail className="text-cyan-400" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Check your email</h1>
          <p className="text-[#94A3B8] mb-2">
            Magic link sent to{' '}
            <span className="gradient-text font-semibold">{email}</span>
          </p>
          <p className="text-[#94A3B8]/60 text-sm mb-10">Click the link in your email to sign in. Expires in 1 hour.</p>

          <div className="glass p-4 mb-6">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
              <p className="text-[#94A3B8] text-sm">No password needed — we keep it simple and secure.</p>
            </div>
          </div>

          <button
            onClick={() => setSent(false)}
            className="text-[#94A3B8] hover:text-white text-sm transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full space-y-6 animate-slide-up">

          {/* Logo + Hero */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-5 w-20 h-20">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center"
                style={{ boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)' }}>
                <span className="text-3xl font-black text-white">D</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-white mb-3 leading-none tracking-tight">
              Break free from porn.
              <br />
              <span className="gradient-text">Reclaim your life.</span>
            </h1>
            <p className="text-[#94A3B8] text-lg mt-3">
              Join <span className="text-white font-bold">50,000+</span> men rewiring their brain with neuroscience
            </p>
          </div>

          {/* Value props */}
          <div className="space-y-3">
            {VALUE_PROPS.map(({ icon: Icon, label, desc, color, glow }) => (
              <div key={label} className="glass glass-hover p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}
                  style={{ boxShadow: `0 0 20px ${glow}` }}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{label}</p>
                  <p className="text-[#94A3B8] text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Auth card */}
          <div className="glass p-6">
            <h2 className="text-xl font-black text-white mb-1">Start your journey</h2>
            <p className="text-[#94A3B8] text-sm mb-6">Enter your email for a secure, passwordless login</p>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#94A3B8] mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-[#94A3B8]/40 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 btn-primary py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: email ? '0 0 30px rgba(124,58,237,0.4)' : 'none' }}
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    Send magic link <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#050810] px-3 text-xs text-[#94A3B8]/50" style={{ background: 'rgba(255,255,255,0.02)' }}>or</span>
              </div>
            </div>

            <button
              onClick={handleGuestMode}
              className="w-full py-3.5 btn-secondary text-sm font-semibold"
            >
              Continue as guest — explore the app
            </button>
          </div>

          <p className="text-center text-xs text-[#94A3B8]/40 leading-relaxed">
            Not a substitute for professional medical advice.
            <br />
            If you are in crisis, call 988 (Suicide &amp; Crisis Lifeline).
          </p>
        </div>
      </div>
    </div>
  );
}
