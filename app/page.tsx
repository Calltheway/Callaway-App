import Link from 'next/link';
import { Shield, ChevronRight, Check, Zap, Brain, TrendingUp, MessageCircle, Search, Lock, ArrowRight } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const FEATURES = [
  { icon: Search,        title: 'Instant detection',         desc: 'Keeper scans 90 days of transactions in seconds and surfaces every subscription, price increase, and duplicate charge.' },
  { icon: Brain,         title: 'Plain-English explanations', desc: 'Claude AI explains exactly what the issue is and gives you step-by-step instructions to fix it — no financial jargon.' },
  { icon: TrendingUp,    title: 'Invest the difference',      desc: 'See what your reclaimed money becomes over 10, 20, or 30 years when you put it to work in index funds.' },
  { icon: MessageCircle, title: 'Ask anything',               desc: 'Chat with Keeper AI about any transaction, account, or financial question — 24/7, always in context.' },
  { icon: Lock,          title: 'Read-only security',         desc: 'We connect via Plaid with read-only access. We cannot move money, ever. Your credentials never touch our servers.' },
  { icon: Shield,        title: 'Private by design',          desc: 'Bank-grade encryption at rest and in transit. Disconnect any account instantly. Your data is never sold.' },
];

const STEPS = [
  { n: '1', title: 'Connect your bank',    body: 'Securely link via Plaid. Read-only access — we cannot move money.' },
  { n: '2', title: 'AI scans everything',  body: 'Claude analyzes 90 days of transactions and ranks issues by dollar impact.' },
  { n: '3', title: 'Fix with one click',   body: 'Get exact steps to cancel, negotiate, or dispute every issue Keeper finds.' },
];

const ISSUES = [
  { name: 'Adobe Creative Cloud', type: 'Forgotten subscription', amount: '$659/yr', hot: true  },
  { name: 'Netflix',              type: 'Price increase +48%',    amount: '$276/yr', hot: false },
  { name: 'Spotify',              type: 'Duplicate charge',        amount: '$132/yr', hot: true  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased">

      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00e87a] flex items-center justify-center">
              <span className="text-black font-black text-xs">K</span>
            </div>
            <span className="font-semibold text-white tracking-tight">Keeper</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Features</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Security</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors duration-150">Sign in</Link>
            <Link href="/dashboard" className="h-8 px-4 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors duration-150 flex items-center gap-1.5">
              Get started <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 mb-10 text-xs text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e87a] animate-pulse" />
          Powered by Claude AI · Read-only bank access
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight text-white leading-[0.93] mb-8 max-w-4xl mx-auto">
          Stop paying for<br />
          <span style={{ color: '#00e87a' }}>things you forgot.</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed">
          Keeper scans your accounts, finds every dollar you&apos;re wasting on forgotten
          subscriptions and overcharges, then tells you exactly how to get it back.
        </p>

        <div className="flex items-center justify-center gap-3 mb-24 flex-wrap">
          <Link href="/dashboard" className="h-12 px-8 rounded-xl bg-[#00e87a] text-black font-semibold text-sm flex items-center gap-2 hover:bg-[#00e87a]/90 transition-colors duration-150 cursor-pointer">
            <Zap size={15} /> Start free scan
          </Link>
          <Link href="/dashboard" className="h-12 px-8 rounded-xl border border-white/10 text-zinc-300 text-sm font-medium flex items-center gap-2 hover:border-white/20 hover:text-white transition-all duration-150 cursor-pointer">
            View demo <ArrowRight size={14} />
          </Link>
        </div>

        {/* Giant hero stat */}
        <div>
          <div className="text-[clamp(5rem,16vw,10.5rem)] font-black text-white leading-none tracking-tighter tabular-nums">
            $<AnimatedCounter value={1067} duration={2200} />
          </div>
          <p className="text-zinc-500 text-lg mt-3">average saved per user, per year</p>
        </div>
      </section>

      {/* ── Stats row ───────────────────────────────────── */}
      <section className="border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-3 divide-x divide-white/[0.06]">
          {[
            { value: 1067, prefix: '$', suffix: '/yr', label: 'average savings found'  },
            { value: 98,   prefix: '',  suffix: '%',   label: 'AI accuracy rate'        },
            { value: 2,    prefix: '',  suffix: ' min', label: 'to complete first scan' },
          ].map(({ value, prefix, suffix, label }) => (
            <div key={label} className="text-center px-8">
              <p className="text-4xl font-black text-white tabular-nums mb-1">
                <AnimatedCounter value={value} prefix={prefix} suffix={suffix} duration={1800} />
              </p>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-28">
        <div className="mb-16 max-w-xl">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#00e87a' }}>What Keeper does</p>
          <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
            Every dollar you&apos;re losing, found.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#09090b] p-8 hover:bg-white/[0.025] transition-colors duration-200 cursor-default">
              <Icon size={20} className="mb-5" style={{ color: '#00e87a' }} />
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#00e87a' }}>How it works</p>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight mb-10">
              Under 2 minutes<br />start to finish.
            </h2>
            <div className="space-y-8">
              {STEPS.map(({ n, title, body }, i) => (
                <div key={n} className="flex gap-5">
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {n}
                    </div>
                    {i < STEPS.length - 1 && <div className="w-px h-8 bg-white/[0.06]" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-white font-semibold mb-1">{title}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock scan card */}
          <div className="border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00e87a] animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono">Keeper · live scan</span>
            </div>
            <div className="p-6">
              <p className="text-xs text-zinc-600 mb-1 font-mono uppercase tracking-wider">Annual savings available</p>
              <p className="text-5xl font-black text-white mb-6 tabular-nums">$1,067</p>
              <div className="space-y-0">
                {ISSUES.map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">{item.name}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{item.type}</p>
                    </div>
                    <span className={`text-sm font-semibold ${item.hot ? 'text-red-400' : 'text-amber-400'}`}>
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-32 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.93] mb-6">
            Your money is<br />waiting for you.
          </h2>
          <p className="text-zinc-500 mb-10 max-w-sm mx-auto leading-relaxed">
            Most users find over $500/year in their first scan. Takes under 2 minutes.
          </p>
          <Link href="/dashboard" className="inline-flex h-12 px-10 rounded-xl bg-[#00e87a] text-black font-semibold text-sm items-center gap-2 hover:bg-[#00e87a]/90 transition-colors duration-150 cursor-pointer">
            <Zap size={15} /> Start your free scan
          </Link>
          <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
            {['No credit card required', 'Free forever', 'Cancel anytime'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-zinc-600">
                <Check size={12} style={{ color: '#00e87a' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#00e87a] flex items-center justify-center">
              <span className="text-black font-black" style={{ fontSize: '0.48rem' }}>K</span>
            </div>
            <span className="text-zinc-600 text-sm">Keeper · Powered by Claude AI</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-600 text-xs">
            <Link href="#" className="hover:text-zinc-400 transition-colors duration-150">Privacy</Link>
            <Link href="#" className="hover:text-zinc-400 transition-colors duration-150">Terms</Link>
            <span>© 2026 Keeper</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
