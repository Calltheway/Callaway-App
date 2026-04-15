import Link from 'next/link';
import { Shield, ChevronRight, Check, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Finds Money Leaks',
    body: 'Keeper scans your bank accounts and flags forgotten subscriptions, price increases, duplicate charges, and billing errors automatically.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Analysis',
    body: 'Powered by Claude AI, Keeper explains every issue in plain English and tells you exactly what to do to fix it.',
  },
  {
    icon: '📈',
    title: 'Investment Projections',
    body: "See how much your recovered money could grow. Keeper shows you ETF scenarios so you can put savings to work immediately.",
  },
  {
    icon: '💬',
    title: 'Ask Anything',
    body: 'Chat with Keeper AI about your finances. Get answers about subscriptions, savings strategies, and smart money moves.',
  },
];

const ISSUES = [
  { merchant: 'Adobe Creative Cloud', type: 'Forgotten Subscription', monthly: '$54.99', save: '$659/yr', icon: '🎨' },
  { merchant: 'Netflix',              type: 'Price Increase (+48%)',   monthly: '$22.99', save: '$276/yr', icon: '📺' },
  { merchant: 'Spotify',              type: 'Duplicate Charge',        monthly: '$10.99', save: '$132/yr', icon: '🎵' },
];

const STEPS = [
  { step: '01', title: 'Connect your bank',  body: 'Securely link accounts via Plaid. Read-only access — Keeper can never move your money.' },
  { step: '02', title: 'Keeper scans',        body: 'AI analyzes 90 days of transactions to find every recurring charge, price change, and billing error.' },
  { step: '03', title: 'You take action',     body: 'Get a clear list of issues ranked by dollar impact, with exact steps to cancel, dispute, or negotiate.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-keeper-void overflow-hidden text-keeper-text">

      {/* ── Ambient background ─────────────────────────────── */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="orb w-[900px] h-[900px] bg-keeper-green/5 -top-80 -right-80 animate-float-slow" />
      <div className="orb w-[600px] h-[600px] bg-keeper-blue/5 bottom-0 -left-64 animate-float" />
      <div className="orb w-[350px] h-[350px] bg-keeper-purple/4 top-1/2 left-1/3" />

      {/* Scan line sweeping down */}
      <div className="scan-line" style={{ top: 0 }} />

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-keeper-green/30 blur-md" />
            <div className="relative w-9 h-9 rounded-xl bg-keeper-green flex items-center justify-center shadow-glow-green">
              <span className="text-keeper-void font-black text-sm">K</span>
            </div>
          </div>
          <span className="text-keeper-bright font-bold text-lg tracking-wide">Keeper</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-keeper-text hover:text-keeper-bright text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="btn-primary btn-sm flex items-center gap-1.5">
            Get Started Free <ChevronRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-8 border-keeper-green/20">
          <span className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />
          <span className="text-keeper-green text-xs font-semibold tracking-wide">AI-powered money intelligence</span>
        </div>

        <h1 className="text-6xl font-black text-keeper-bright leading-[1.05] mb-6 max-w-3xl mx-auto">
          Stop losing money to
          <br />
          <span className="gradient-text">forgotten subscriptions</span>
        </h1>

        <p className="text-keeper-text text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Keeper scans your accounts, finds every dollar you&apos;re wasting, and tells you exactly how to get it back — powered by Claude AI.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <Link href="/dashboard" className="btn-primary flex items-center gap-2 text-base px-8 py-4">
            <Zap size={18} />
            Start for free
          </Link>
          <Link href="/dashboard" className="btn-ghost flex items-center gap-2 text-base px-8 py-4">
            See a demo
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          {['Free forever', 'No credit card', 'Bank-level security'].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-keeper-muted text-sm">
              <Check size={13} className="text-keeper-green" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live demo card ─────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="glass-card-glow card-3d relative overflow-hidden p-8">
          {/* Inner scan line */}
          <div className="scan-line top-0" />
          {/* Glow orb inside card */}
          <div className="orb w-64 h-64 bg-keeper-green/8 -top-16 -right-16" />

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-keeper-green animate-pulse" />
                <span className="mono-label text-keeper-green/80">Live scan · 3 issues found</span>
              </div>
              <span className="mono-label">DEMO</span>
            </div>

            <div className="mb-8">
              <p className="text-keeper-muted text-sm mb-1">Potential annual savings</p>
              <p className="text-6xl font-black glow-text tracking-tight">
                $1,067
                <span className="text-2xl font-normal text-keeper-muted ml-2">/yr</span>
              </p>
            </div>

            <div className="space-y-3">
              {ISSUES.map((issue, i) => (
                <div
                  key={issue.merchant}
                  className="glass-card px-5 py-4 flex items-center justify-between"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{issue.icon}</span>
                    <div>
                      <p className="text-keeper-bright font-semibold text-sm">{issue.merchant}</p>
                      <p className="mono-label mt-0.5">{issue.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-keeper-red font-bold text-sm">
                      {issue.monthly}<span className="text-xs font-normal text-keeper-muted">/mo</span>
                    </p>
                    <p className="text-keeper-green text-xs font-semibold">Save {issue.save}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-14">
          <p className="mono-label text-keeper-green/70 mb-3">CAPABILITIES</p>
          <h2 className="text-4xl font-black text-keeper-bright">Everything you need to stop overpaying</h2>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card card-3d p-7">
              <p className="text-4xl mb-5">{f.icon}</p>
              <h3 className="text-keeper-bright font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-keeper-text leading-relaxed text-sm">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-14">
          <p className="mono-label text-keeper-green/70 mb-3">PROCESS</p>
          <h2 className="text-4xl font-black text-keeper-bright">How Keeper works</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {STEPS.map(({ step, title, body }, i) => (
            <div key={step} className="relative text-center group">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-px bg-gradient-to-r from-keeper-green/30 to-transparent pointer-events-none" />
              )}
              <div className="relative w-12 h-12 rounded-full border border-keeper-green/30 bg-keeper-green/8 flex items-center justify-center mx-auto mb-5 group-hover:border-keeper-green/60 group-hover:bg-keeper-green/15 transition-all">
                <span className="mono-label text-keeper-green text-xs">{step}</span>
              </div>
              <h3 className="text-keeper-bright font-bold mb-2">{title}</h3>
              <p className="text-keeper-text text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security ───────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-24">
        <div className="glass-card-glow p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center">
              <Shield size={16} className="text-keeper-green" />
            </div>
            <div>
              <h2 className="text-keeper-bright font-bold text-xl">Bank-level security</h2>
              <p className="mono-label">Your data is always protected</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Keeper never stores your bank login credentials',
              'All data encrypted in transit and at rest',
              'Read-only access — we cannot move your money',
              'Disconnect any account instantly, at any time',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-keeper-green" />
                </div>
                <p className="text-keeper-text text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-8 pb-28 text-center">
        <div className="orb w-[500px] h-[500px] bg-keeper-green/6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="relative">
          <p className="mono-label text-keeper-green/70 mb-4">GET STARTED</p>
          <h2 className="text-5xl font-black text-keeper-bright mb-4 leading-tight">
            Start saving <span className="gradient-text">today</span>
          </h2>
          <p className="text-keeper-text mb-10 text-lg">
            Most users find over <span className="text-keeper-green font-semibold">$500/year</span> in their first scan.
          </p>
          <Link href="/dashboard" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            <Zap size={18} />
            Get started for free
          </Link>
          <p className="text-keeper-muted text-sm mt-5">No credit card · Cancel anytime · Free forever</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-keeper-border/50 py-8 bg-keeper-void/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 rounded bg-keeper-green/20 blur-sm" />
              <div className="relative w-6 h-6 rounded bg-keeper-green flex items-center justify-center">
                <span className="text-keeper-void font-black text-xs">K</span>
              </div>
            </div>
            <span className="text-keeper-muted text-sm">Keeper · Powered by Claude AI</span>
          </div>
          <p className="text-keeper-muted text-xs">© 2026 Keeper. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
