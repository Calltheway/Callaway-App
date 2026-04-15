import Link from 'next/link';
import {
  Shield, ChevronRight, Check, Zap, Brain, TrendingUp,
  MessageCircle, Search, Lock, Sparkles, ArrowRight,
} from 'lucide-react';

const ISSUES = [
  { merchant: 'Adobe Creative Cloud', type: 'Forgotten Subscription', monthly: '$54.99', annual: '$659', color: 'text-keeper-red' },
  { merchant: 'Netflix',              type: 'Price Increase +48%',    monthly: '$22.99', annual: '$276', color: 'text-amber-400' },
  { merchant: 'Spotify',              type: 'Duplicate Charge',       monthly: '$10.99', annual: '$132', color: 'text-keeper-red' },
];

const PROJECTIONS = [
  { yr: '1yr',  val: '$2.5K',  h: 15  },
  { yr: '5yr',  val: '$15K',   h: 35  },
  { yr: '10yr', val: '$38K',   h: 55  },
  { yr: '20yr', val: '$112K',  h: 78  },
  { yr: '30yr', val: '$272K',  h: 100 },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-keeper-void overflow-hidden text-keeper-text">

      {/* ── Ambient background ─────────────────────────── */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="orb w-[900px] h-[900px] bg-keeper-green/5 -top-80 -right-64 animate-float-slow" />
      <div className="orb w-[600px] h-[600px] bg-keeper-blue/4 bottom-0 -left-48 animate-float" />
      <div className="orb w-[400px] h-[400px] bg-keeper-purple/3 top-1/2 left-1/4" />
      <div className="scan-line top-0" />

      {/* ── Floating Nav ───────────────────────────────── */}
      <div className="relative z-50 flex justify-center pt-5 px-6">
        <nav className="glass-card flex items-center justify-between px-6 py-3 rounded-2xl w-full max-w-5xl">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-keeper-green/30 blur-md" />
              <div className="relative w-8 h-8 rounded-xl bg-keeper-green flex items-center justify-center shadow-glow-green">
                <span className="text-keeper-void font-black text-xs">K</span>
              </div>
            </div>
            <span className="text-keeper-bright font-bold tracking-wide">Keeper</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-keeper-text hover:text-keeper-bright text-sm font-medium transition-colors duration-200">
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-primary btn-sm flex items-center gap-1.5">
              Get Started <ChevronRight size={13} />
            </Link>
          </div>
        </nav>
      </div>

      {/* ── Bento Grid ─────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-8 pb-24">
        <div className="grid grid-cols-3 gap-4">

          {/* ── HERO — full width ──────────────────────── */}
          <div className="col-span-3 glass-card relative overflow-hidden px-10 py-16 text-center">
            <div className="orb w-96 h-96 bg-keeper-green/8 -top-24 left-1/2 -translate-x-1/2" />
            <div className="scan-line top-0" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-keeper-green/10 border border-keeper-green/25 px-4 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />
                <span className="text-keeper-green text-xs font-semibold tracking-widest uppercase">AI-powered money intelligence</span>
              </div>

              <h1 className="text-[3.5rem] font-black text-keeper-bright leading-[1.05] mb-5 max-w-2xl mx-auto">
                Stop losing money to<br />
                <span className="gradient-text">forgotten subscriptions</span>
              </h1>

              <p className="text-keeper-text text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                Keeper scans your accounts, finds every dollar you&apos;re wasting, and tells you exactly how to get it back — powered by Claude AI.
              </p>

              <div className="flex items-center justify-center gap-4 mb-10 flex-wrap">
                <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
                  <Zap size={17} /> Start for free
                </Link>
                <Link href="/dashboard" className="btn-ghost flex items-center gap-2 text-base px-8 py-4">
                  See a demo <ArrowRight size={15} />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 flex-wrap">
                {[
                  { label: 'Avg savings found', value: '$1,067/yr' },
                  { label: 'AI confidence',      value: '98%'      },
                  { label: 'Setup time',         value: '2 min'    },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-keeper-bright font-black text-xl">{value}</p>
                    <p className="mono-label">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── LIVE SCAN — 2 cols ─────────────────────── */}
          <div className="col-span-2 glass-card-glow relative overflow-hidden p-7">
            <div className="orb w-56 h-56 bg-keeper-green/8 -top-14 -right-14" />
            <div className="scan-line top-0" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-keeper-green animate-pulse" />
                  <span className="mono-label text-keeper-green/80">Live scan · issues detected</span>
                </div>
                <span className="mono-label">DEMO</span>
              </div>

              <div className="mb-5">
                <p className="mono-label mb-1">Potential annual savings</p>
                <p className="text-5xl font-black glow-text">$1,067<span className="text-xl font-normal text-keeper-muted">/yr</span></p>
              </div>

              <div className="space-y-2.5">
                {ISSUES.map((issue) => (
                  <div key={issue.merchant} className="glass-card px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-keeper-bright font-semibold text-sm">{issue.merchant}</p>
                      <p className="mono-label mt-0.5">{issue.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-sm ${issue.color}`}>{issue.monthly}<span className="text-xs font-normal text-keeper-muted">/mo</span></p>
                      <p className="text-keeper-green text-xs font-semibold">Save {issue.annual}/yr</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BIG NUMBER — 1 col ────────────────────── */}
          <div className="glass-card relative overflow-hidden p-7 flex flex-col justify-between">
            <div className="orb w-40 h-40 bg-keeper-green/12 -bottom-10 -right-10" />
            <div className="relative">
              <Search size={20} className="text-keeper-green mb-4" />
              <p className="mono-label mb-2">Found for users</p>
              <p className="text-5xl font-black glow-text leading-none mb-1">$1,067</p>
              <p className="text-keeper-muted text-sm">per year on average</p>
            </div>
            <div className="relative mt-6 pt-4 border-t border-keeper-border/50">
              <div className="flex items-center gap-2">
                <Check size={13} className="text-keeper-green" />
                <span className="text-keeper-text text-xs">Free to get started</span>
              </div>
            </div>
          </div>

          {/* ── AI POWERED — 1 col ────────────────────── */}
          <div className="glass-card relative overflow-hidden p-6">
            <div className="orb w-32 h-32 bg-keeper-blue/10 -top-8 -right-8" />
            <div className="relative">
              <div className="relative mb-4 w-12 h-12">
                <div className="absolute inset-0 rounded-2xl bg-keeper-green/20 blur-lg animate-glow-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center">
                  <Brain size={22} className="text-keeper-green" />
                </div>
              </div>
              <h3 className="text-keeper-bright font-bold text-lg mb-2">AI-Powered Analysis</h3>
              <p className="text-keeper-text text-sm leading-relaxed">
                Claude AI explains every issue in plain English and tells you exactly what to do.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-keeper-green/8 border border-keeper-green/20 rounded-full px-3 py-1">
                <Sparkles size={11} className="text-keeper-green" />
                <span className="text-keeper-green text-xs font-semibold">Powered by Claude</span>
              </div>
            </div>
          </div>

          {/* ── INVEST — 1 col ────────────────────────── */}
          <div className="glass-card relative overflow-hidden p-6">
            <div className="orb w-32 h-32 bg-keeper-purple/10 -bottom-8 -left-8" />
            <div className="relative">
              <TrendingUp size={20} className="text-keeper-green mb-4" />
              <h3 className="text-keeper-bright font-bold text-lg mb-4">Investment Projections</h3>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5 h-20 mb-2">
                {PROJECTIONS.map((p) => (
                  <div key={p.yr} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-keeper-green/40 to-keeper-green/80 transition-all duration-500"
                      style={{ height: `${p.h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                {PROJECTIONS.map((p) => (
                  <div key={p.yr} className="flex-1 text-center">
                    <p className="mono-label" style={{ fontSize: '0.5rem' }}>{p.yr}</p>
                  </div>
                ))}
              </div>
              <p className="text-keeper-green font-black text-xl mt-3">$272K <span className="text-xs font-normal text-keeper-muted">in 30yr</span></p>
            </div>
          </div>

          {/* ── CHAT — 1 col ──────────────────────────── */}
          <div className="glass-card relative overflow-hidden p-6">
            <div className="relative">
              <MessageCircle size={20} className="text-keeper-green mb-4" />
              <h3 className="text-keeper-bright font-bold text-lg mb-4">Ask AI Anything</h3>
              {/* Chat bubbles */}
              <div className="space-y-2">
                <div className="flex gap-2 items-end">
                  <div className="w-5 h-5 rounded-full bg-keeper-green/20 border border-keeper-green/25 flex items-center justify-center shrink-0">
                    <span className="text-keeper-green font-black" style={{ fontSize: '0.5rem' }}>K</span>
                  </div>
                  <div className="glass-card px-3 py-2 rounded-2xl rounded-bl-sm text-xs text-keeper-text max-w-[160px]">
                    What&apos;s my biggest money leak?
                  </div>
                </div>
                <div className="flex gap-2 items-end justify-end">
                  <div className="bg-keeper-green/10 border border-keeper-green/20 px-3 py-2 rounded-2xl rounded-br-sm text-xs text-keeper-bright max-w-[160px]">
                    Adobe at $54.99/mo — cancel in 2 min to save $659/yr.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECURITY — 2 cols ─────────────────────── */}
          <div className="col-span-2 glass-card relative overflow-hidden p-7">
            <div className="orb w-48 h-48 bg-keeper-blue/6 -bottom-12 -right-12" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center">
                  <Lock size={16} className="text-keeper-green" />
                </div>
                <div>
                  <h3 className="text-keeper-bright font-bold text-lg">Bank-level security</h3>
                  <p className="mono-label">Your data is always protected</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Keeper never stores your bank login credentials',
                  'All data encrypted in transit and at rest',
                  'Read-only access — we cannot move your money',
                  'Disconnect any account instantly, at any time',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-keeper-green/10 border border-keeper-green/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={10} className="text-keeper-green" />
                    </div>
                    <p className="text-keeper-text text-sm leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── HOW IT WORKS — 1 col ──────────────────── */}
          <div className="glass-card relative overflow-hidden p-6">
            <div className="relative">
              <p className="mono-label text-keeper-green/70 mb-4">HOW IT WORKS</p>
              <div className="space-y-5">
                {[
                  { n: '01', title: 'Connect',  body: 'Securely link your bank via Plaid. Read-only.' },
                  { n: '02', title: 'Scan',     body: 'AI analyzes 90 days of transactions instantly.' },
                  { n: '03', title: 'Act',      body: 'Get ranked issues with exact steps to fix them.' },
                ].map(({ n, title, body }, i) => (
                  <div key={n} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full border border-keeper-green/30 bg-keeper-green/8 flex items-center justify-center shrink-0">
                        <span className="mono-label text-keeper-green" style={{ fontSize: '0.5rem' }}>{n}</span>
                      </div>
                      {i < 2 && <div className="w-px flex-1 bg-keeper-border/50 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-keeper-bright font-semibold text-sm">{title}</p>
                      <p className="text-keeper-muted text-xs leading-relaxed mt-0.5">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CTA — full width ──────────────────────── */}
          <div className="col-span-3 glass-card-glow relative overflow-hidden px-10 py-14 text-center">
            <div className="orb w-[500px] h-[500px] bg-keeper-green/6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="scan-line top-0" />
            <div className="relative">
              <p className="mono-label text-keeper-green/70 mb-4">GET STARTED TODAY</p>
              <h2 className="text-4xl font-black text-keeper-bright mb-3 leading-tight">
                Start saving <span className="gradient-text">immediately</span>
              </h2>
              <p className="text-keeper-text mb-8 max-w-md mx-auto">
                Most users find over <span className="text-keeper-green font-semibold">$500/year</span> in their very first scan. Takes under 2 minutes.
              </p>
              <Link href="/dashboard" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
                <Zap size={17} /> Get started for free
              </Link>
              <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
                {['No credit card', 'Free forever', 'Cancel anytime'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-keeper-muted text-xs">
                    <Check size={11} className="text-keeper-green" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-keeper-border/40 py-7 bg-keeper-void/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded bg-keeper-green/20 blur-sm" />
              <div className="relative w-6 h-6 rounded bg-keeper-green flex items-center justify-center">
                <span className="text-keeper-void font-black text-xs">K</span>
              </div>
            </div>
            <span className="text-keeper-muted text-sm">Keeper · Powered by Claude AI</span>
          </div>
          <div className="flex items-center gap-6 text-keeper-muted text-xs">
            <Link href="#" className="hover:text-keeper-bright transition-colors duration-200">Privacy</Link>
            <Link href="#" className="hover:text-keeper-bright transition-colors duration-200">Terms</Link>
            <span>© 2026 Keeper</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
