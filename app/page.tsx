import Link from 'next/link';
import { Shield, TrendingDown, Zap, CheckCircle, ArrowRight, Lock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-emerald-400 font-black text-sm">K</div>
            <span className="font-bold text-navy-900 text-lg">Keeper</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">Sign in</Link>
            <Link href="/sign-in?mode=signup" className="text-sm font-semibold bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-700 to-navy-900 text-white px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-emerald-500/30">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI-powered · Read-only · Bank-level security
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Stop losing{' '}
            <span className="text-emerald-400">$3,000 a year</span>{' '}
            to bills you forgot about
          </h1>
          <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
            Keeper connects to your bank and email, finds every subscription, billing error,
            and overcharge — then helps you get that money back.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-in?mode=signup"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Start finding your money <ArrowRight size={20} />
            </Link>
            <p className="text-white/50 text-sm">Free · No credit card required</p>
          </div>
        </div>
      </section>

      {/* Social proof numbers */}
      <section className="border-b border-slate-100 px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '$3,000–$5,000', label: 'average annual household loss' },
            { value: '90 days',       label: 'of transactions analyzed instantly' },
            { value: '20%',           label: 'fee only on money we actually recover' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-navy-900">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-navy-900 text-center mb-4">How Keeper works</h2>
          <p className="text-slate-500 text-center mb-14">Three steps. Takes 2 minutes to set up.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🏦',
                title: 'Connect your bank',
                desc: 'Keeper uses Plaid — the same technology as Venmo and Robinhood — to securely connect your accounts. Read-only. We never see your password.',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI scans everything',
                desc: 'Claude AI analyzes 90 days of transactions, finds recurring charges, compares them month-to-month, and flags every issue with a confidence score.',
              },
              {
                step: '03',
                icon: '💰',
                title: 'Get your money back',
                desc: "Keeper shows you exactly what's wrong and either walks you through fixing it or handles it for you. You pay 20% of what we recover — nothing if we find nothing.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="text-7xl font-black text-slate-100 absolute -top-4 -left-2 select-none">{step}</div>
                <div className="relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="font-bold text-navy-900 text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Keeper finds */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-navy-900 text-center mb-4">What Keeper finds</h2>
          <p className="text-slate-500 text-center mb-12">Most users find $200–$400/month in hidden costs on their first scan.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '🔄', label: 'Forgotten subscriptions', color: 'bg-red-50 border-red-100' },
              { emoji: '📈', label: 'Price increases you missed', color: 'bg-orange-50 border-orange-100' },
              { emoji: '📋', label: 'Duplicate charges', color: 'bg-red-50 border-red-100' },
              { emoji: '💤', label: 'Unused subscriptions', color: 'bg-amber-50 border-amber-100' },
              { emoji: '🎁', label: 'Unclaimed refunds', color: 'bg-emerald-50 border-emerald-100' },
              { emoji: '⚠️', label: 'Billing errors', color: 'bg-red-50 border-red-100' },
            ].map(({ emoji, label, color }) => (
              <div key={label} className={`border rounded-xl p-4 flex items-center gap-3 ${color}`}>
                <span className="text-2xl">{emoji}</span>
                <span className="font-medium text-navy-900 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-navy-900 rounded-3xl p-10 text-white">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-emerald-400" size={24} />
              <h2 className="text-2xl font-black">Security you can count on</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: '✓', text: 'Read-only bank access — Keeper can never move money' },
                { icon: '✓', text: 'Bank credentials handled by Plaid, not Keeper' },
                { icon: '✓', text: 'All tokens encrypted at rest' },
                { icon: '✓', text: 'Your data is never sold or shared with advertisers' },
                { icon: '✓', text: 'Disconnect any account at any time, instantly' },
                { icon: '✓', text: 'Session timeout after 15 minutes of inactivity' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">{icon}</span>
                  <span className="text-white/75 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-500 px-6 py-16 text-center">
        <h2 className="text-3xl font-black text-white mb-3">Ready to see what you're losing?</h2>
        <p className="text-emerald-100 mb-8">Set up takes 2 minutes. Most users find their first issue in under 60 seconds.</p>
        <Link
          href="/sign-in?mode=signup"
          className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-colors"
        >
          Start for free <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-navy-900 flex items-center justify-center text-emerald-400 font-black text-xs">K</div>
            <span className="font-medium text-navy-900">Keeper</span>
          </div>
          <p>© 2026 Keeper. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
