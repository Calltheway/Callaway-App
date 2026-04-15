import Link from 'next/link';
import { Shield, TrendingUp, MessageCircle, ChevronRight, Check } from 'lucide-react';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Finds Money Leaks',
    body: 'Keeper scans your bank accounts and flags forgotten subscriptions, price increases, duplicate charges, and billing errors.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Analysis',
    body: 'Powered by Claude AI, Keeper explains every issue in plain English and tells you exactly what to do about it.',
  },
  {
    icon: '📈',
    title: 'Investment Projections',
    body: "See how much your recovered money could grow. Keeper shows you ETF scenarios so you can put savings to work.",
  },
  {
    icon: '💬',
    title: 'Ask Anything',
    body: 'Chat with Keeper AI about your finances. Get answers about subscriptions, savings strategies, and money moves.',
  },
];

const ISSUES = [
  { merchant: 'Adobe Creative Cloud', type: 'Forgotten Subscription', monthly: '$54.99', save: '$659/yr' },
  { merchant: 'Netflix',              type: 'Price Increase (+48%)',   monthly: '$22.99', save: '$276/yr' },
  { merchant: 'Spotify',              type: 'Duplicate Charge',        monthly: '$10.99', save: '$132/yr' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-keeper-base text-keeper-text">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-keeper-border max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-keeper-green flex items-center justify-center">
            <span className="text-keeper-base font-black text-sm">K</span>
          </div>
          <span className="text-keeper-bright font-bold text-lg">Keeper</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-keeper-text hover:text-keeper-bright text-sm font-medium transition-colors">
            Sign In
          </Link>
          <Link href="/dashboard" className="keeper-btn-primary text-sm px-5 py-2.5">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-keeper-green/10 border border-keeper-green/25 text-keeper-green text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />
          AI-powered money intelligence
        </div>

        <h1 className="text-5xl font-black text-keeper-bright leading-tight mb-6 max-w-3xl mx-auto">
          Stop losing money to<br />
          <span className="text-keeper-green">forgotten subscriptions</span>
        </h1>

        <p className="text-keeper-text text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Keeper scans your bank accounts, finds every dollar you're wasting, and tells you exactly how to get it back — powered by Claude AI.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
          <Link href="/dashboard" className="keeper-btn-primary flex items-center gap-2 text-base px-7 py-3.5">
            Start for free <ChevronRight size={18} />
          </Link>
          <Link href="/dashboard" className="keeper-btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
            See a demo
          </Link>
        </div>

        <p className="text-keeper-muted text-sm">Free forever · No credit card required · Bank-level security</p>
      </section>

      {/* Live demo */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="keeper-card-hero p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-keeper-green animate-pulse" />
            <span className="keeper-label text-keeper-green/80">Keeper found issues in your accounts</span>
          </div>

          <div className="mb-4">
            <p className="text-keeper-muted text-sm mb-1">Potential annual savings</p>
            <p className="text-5xl font-black text-keeper-red">$1,067<span className="text-2xl font-normal text-keeper-muted">/yr</span></p>
          </div>

          <div className="space-y-3 mt-6">
            {ISSUES.map((issue) => (
              <div key={issue.merchant} className="bg-keeper-card/60 rounded-xl px-5 py-4 flex items-center justify-between border border-keeper-border/60">
                <div>
                  <p className="text-keeper-bright font-semibold text-sm">{issue.merchant}</p>
                  <p className="keeper-label mt-0.5">{issue.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-keeper-red font-bold text-sm">{issue.monthly}<span className="text-xs font-normal text-keeper-muted">/mo</span></p>
                  <p className="text-keeper-green text-xs font-semibold">Save {issue.save}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-black text-keeper-bright text-center mb-12">Everything you need to stop overpaying</h2>
        <div className="grid grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="keeper-card p-6">
              <p className="text-3xl mb-4">{f.icon}</p>
              <h3 className="text-keeper-bright font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-keeper-text leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-black text-keeper-bright text-center mb-12">How Keeper works</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Connect your bank',   body: 'Securely link your accounts via Plaid. Read-only access — Keeper can never move your money.' },
            { step: '2', title: 'Keeper scans',         body: 'AI analyzes 90 days of transactions to find every recurring charge, price change, and billing error.' },
            { step: '3', title: 'You take action',      body: 'Get a clear list of issues ranked by dollar impact, with exact steps to cancel, dispute, or negotiate.' },
          ].map(({ step, title, body }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-keeper-green/10 border border-keeper-green/25 flex items-center justify-center mx-auto mb-4">
                <span className="text-keeper-green font-black text-lg">{step}</span>
              </div>
              <h3 className="text-keeper-bright font-bold mb-2">{title}</h3>
              <p className="text-keeper-text text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="keeper-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={20} className="text-keeper-green" />
            <h2 className="text-keeper-bright font-bold text-xl">Bank-level security</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              'Keeper never stores your bank login credentials',
              'All data encrypted in transit and at rest',
              'Read-only access — we cannot move your money',
              'Disconnect any account instantly, at any time',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Check size={15} className="text-keeper-green shrink-0 mt-0.5" />
                <p className="text-keeper-text text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-8 pb-24 text-center">
        <h2 className="text-4xl font-black text-keeper-bright mb-4">Start saving today</h2>
        <p className="text-keeper-text mb-8 text-lg">Most users find over $500/year in their first scan.</p>
        <Link href="/dashboard" className="keeper-btn-primary text-base px-8 py-4 inline-flex items-center gap-2">
          Get started for free <ChevronRight size={18} />
        </Link>
        <p className="text-keeper-muted text-sm mt-4">No credit card · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-keeper-border py-8">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-keeper-green flex items-center justify-center">
              <span className="text-keeper-base font-black text-xs">K</span>
            </div>
            <span className="text-keeper-muted text-sm">Keeper · Powered by Claude AI</span>
          </div>
          <p className="text-keeper-muted text-xs">© 2026 Keeper. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
