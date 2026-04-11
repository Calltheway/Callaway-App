'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Calendar,
  DollarSign,
  Heart,
  Users,
  Target,
  Check,
  ChevronDown,
  ArrowRight,
  Brain,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  Shield,
  Lock,
} from 'lucide-react';

// ─── Insight card types ────────────────────────────────────────────────────────
type InsightLevel = 'alert' | 'warning' | 'info';

interface InsightCard {
  level: InsightLevel;
  category: string;
  title: string;
  confidence: number;
  points: string[];
}

const insightCards: InsightCard[] = [
  {
    level: 'alert',
    category: 'Social Health',
    title: 'Isolation Index +34% this month',
    confidence: 91,
    points: [
      'Outbound messages dropped 61% vs. 90-day avg',
      'Last meaningful 1:1 conversation: 11 days ago',
      'Calendar shows 0 social events this week',
    ],
  },
  {
    level: 'warning',
    category: 'Sleep × Work',
    title: 'Sleep dropped 41 min since job change',
    confidence: 88,
    points: [
      'Avg bedtime shifted from 10:48 PM → 12:19 AM',
      'Calendar events starting before 8 AM: +4/week',
      'HRV trending down 12% over same period',
    ],
  },
  {
    level: 'info',
    category: 'Financial',
    title: 'Savings rate improved 8% vs last quarter',
    confidence: 95,
    points: [
      'Dining spend down $340 vs Q3 average',
      'Two subscription cancellations detected',
      'Investment transfers up $200/month',
    ],
  },
];

// ─── Feature data ──────────────────────────────────────────────────────────────
const features = [
  {
    icon: Mail,
    title: 'Email Intelligence',
    desc: 'Relationship map, stress detection, commitment tracking',
    bullets: ['Maps your relationship network by depth', 'Detects stress signals in language patterns', 'Tracks promises made and deadlines missed'],
  },
  {
    icon: Calendar,
    title: 'Calendar Analysis',
    desc: 'Social vs work balance, cancellation patterns, sleep inference',
    bullets: ['Social vs deep work ratio trends', 'Cancellation patterns and meeting avoidance', 'Sleep schedule inference from event timing'],
  },
  {
    icon: DollarSign,
    title: 'Financial Oracle',
    desc: 'Spending anomalies, savings rate, subscription leakage',
    bullets: ['Detects anomalous spend before it compounds', 'Subscription leakage and zombie charges', 'Emotion-spending correlation analysis'],
  },
  {
    icon: Heart,
    title: 'Health Intelligence',
    desc: 'Sleep quality, HRV trends, workout consistency',
    bullets: ['Sleep quality scoring and debt tracking', 'HRV trend analysis and recovery scoring', 'Workout consistency and plateau detection'],
  },
  {
    icon: Users,
    title: 'Relationship Graph',
    desc: 'Who you\'re neglecting, social health score',
    bullets: ['Flags relationships going cold', 'Social health score updated weekly', 'Reconnection timing recommendations'],
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    desc: 'Progress velocity, blockers, momentum detection',
    bullets: ['Progress velocity vs your baseline', 'Identifies behavioral blockers automatically', 'Momentum surge and stall detection'],
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: 'Oracle told me I was on the path to burnout 3 weeks before I felt it. The isolation index was the first signal.',
    author: 'Sarah K.',
    role: 'Product Manager',
    initials: 'SK',
  },
  {
    quote: 'It found a correlation between my spending and my stress that I\'d never noticed. Now I treat overspending as a stress alert.',
    author: 'Marcus T.',
    role: 'Senior Engineer',
    initials: 'MT',
  },
  {
    quote: 'My therapist saw patterns in a year; Oracle found them in a week. It\'s like having a second brain that remembers everything.',
    author: 'Emma R.',
    role: 'Founder',
    initials: 'ER',
  },
];

// ─── FAQ data ──────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'How does Oracle keep my data private?',
    a: 'Your data is encrypted at rest and in transit using AES-256. We never sell or share your personal information with third parties. Each user\'s data is stored in an isolated namespace and never used to train our AI models. You can delete all your data at any time.',
  },
  {
    q: 'How does Oracle actually work?',
    a: 'Oracle connects to your email, calendar, and financial accounts via secure OAuth and read-only APIs. Our AI ingests that data, builds a unified model of your patterns, and surfaces insights using a combination of statistical anomaly detection and large language model reasoning.',
  },
  {
    q: 'What data security certifications does Oracle have?',
    a: 'Oracle is SOC 2 Type II certified. All financial connections use Plaid\'s bank-grade security infrastructure. We conduct third-party penetration testing quarterly and maintain an active bug bounty program.',
  },
  {
    q: 'Which integrations are currently supported?',
    a: 'Currently supported: Gmail, Outlook, Google Calendar, Apple Calendar, Plaid (5,000+ financial institutions), Apple Health, Fitbit, and Oura Ring. Notion, Spotify, and Whoop integrations are launching in Q2 2026.',
  },
  {
    q: 'What AI model powers Oracle?',
    a: 'Oracle uses Claude (Anthropic) for reasoning and insight generation, combined with proprietary statistical models trained on anonymized behavioral patterns. We chose Claude for its exceptional ability to reason about complex, multi-dimensional human behavior.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. Cancel with one click from your account settings — no phone calls, no retention flows. You\'ll retain access until the end of your billing period. We\'ll remind you 3 days before your next charge.',
  },
];

// ─── Insight level styling ─────────────────────────────────────────────────────
function levelConfig(level: InsightLevel) {
  switch (level) {
    case 'alert':
      return {
        border: 'border-l-oracle-crimson',
        badge: 'bg-oracle-crimson/10 text-oracle-crimson border-oracle-crimson/30',
        icon: AlertTriangle,
        iconColor: 'text-oracle-crimson',
        dot: 'bg-oracle-crimson',
      };
    case 'warning':
      return {
        border: 'border-l-oracle-amber',
        badge: 'bg-oracle-amber/10 text-oracle-amber border-oracle-amber/30',
        icon: AlertTriangle,
        iconColor: 'text-oracle-amber',
        dot: 'bg-oracle-amber',
      };
    case 'info':
      return {
        border: 'border-l-oracle-teal',
        badge: 'bg-oracle-teal/10 text-oracle-teal border-oracle-teal/30',
        icon: Info,
        iconColor: 'text-oracle-teal',
        dot: 'bg-oracle-teal',
      };
  }
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-oracle-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-oracle-card/50 transition-colors"
      >
        <span className="font-medium text-oracle-bright text-sm leading-relaxed pr-4">{q}</span>
        <ChevronDown
          size={18}
          className={`text-oracle-muted flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-oracle-text text-sm leading-relaxed border-t border-oracle-border bg-oracle-card/30">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function OracleLandingPage() {
  return (
    <div className="min-h-screen bg-oracle-base font-sans text-oracle-text">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-oracle-base/80 backdrop-blur-md border-b border-oracle-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-oracle-teal/10 border border-oracle-teal/30 flex items-center justify-center">
              <span className="text-oracle-teal font-display font-bold text-base leading-none">O</span>
            </div>
            <span className="font-display font-semibold text-oracle-bright text-lg tracking-tight">Oracle</span>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="oracle-btn-ghost text-sm py-2 px-5">
              Sign in
            </Link>
            <Link href="/sign-in?mode=signup" className="oracle-btn-primary text-sm py-2 px-5 inline-flex items-center gap-1.5">
              Get early access <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden bg-oracle-gradient neural-bg">

        {/* Decorative glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-oracle-teal/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-oracle-teal/3 blur-2xl pointer-events-none" />

        {/* SVG neural network decoration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Connecting lines */}
          <line x1="10%" y1="20%" x2="35%" y2="45%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="35%" y1="45%" x2="65%" y2="30%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="65%" y1="30%" x2="90%" y2="55%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="35%" y1="45%" x2="50%" y2="70%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="65%" y1="30%" x2="50%" y2="70%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="20%" y1="75%" x2="50%" y2="70%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="80%" y1="80%" x2="50%" y2="70%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="10%" y1="20%" x2="20%" y2="75%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="90%" y1="55%" x2="80%" y2="80%" stroke="#00E5CC" strokeWidth="0.5" />
          {/* Nodes */}
          <circle cx="10%" cy="20%" r="3" fill="#00E5CC" />
          <circle cx="35%" cy="45%" r="4" fill="#00E5CC" />
          <circle cx="65%" cy="30%" r="3" fill="#00E5CC" />
          <circle cx="90%" cy="55%" r="2.5" fill="#00E5CC" />
          <circle cx="50%" cy="70%" r="4" fill="#00E5CC" />
          <circle cx="20%" cy="75%" r="2.5" fill="#00E5CC" />
          <circle cx="80%" cy="80%" r="3" fill="#00E5CC" />
          <circle cx="75%" cy="15%" r="2" fill="#00E5CC" />
          <circle cx="15%" cy="50%" r="2" fill="#00E5CC" />
          <line x1="75%" y1="15%" x2="65%" y2="30%" stroke="#00E5CC" strokeWidth="0.5" />
          <line x1="15%" y1="50%" x2="35%" y2="45%" stroke="#00E5CC" strokeWidth="0.5" />
        </svg>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-oracle-teal/30 bg-oracle-teal/5 text-oracle-teal text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-oracle-teal rounded-full animate-pulse-slow" />
            AI · Second Brain · Intelligence
          </div>

          {/* H1 */}
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-oracle-bright">
            The AI That Knows{' '}
            <span className="text-gradient-teal">Your Entire Life</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-oracle-text leading-relaxed mb-10 max-w-2xl mx-auto">
            Oracle ingests every dimension of your life and surfaces non-obvious insights about patterns,
            risks, and opportunities — acting as your personal strategist for{' '}
            <span className="text-oracle-bright font-medium">$20/month</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/sign-in?mode=signup" className="oracle-btn-primary inline-flex items-center gap-2 text-base px-8 py-4 glow-teal">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="#demo" className="oracle-btn-ghost inline-flex items-center gap-2 text-base px-8 py-4">
              See a demo <Zap size={16} className="text-oracle-teal" />
            </Link>
          </div>

          {/* Demo insight cards */}
          <div id="demo" className="grid md:grid-cols-3 gap-4 text-left">
            {insightCards.map((card) => {
              const cfg = levelConfig(card.level);
              const IconComp = cfg.icon;
              return (
                <div
                  key={card.title}
                  className={`oracle-card border-l-4 ${cfg.border} p-5 flex flex-col gap-3`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <IconComp size={15} className={`${cfg.iconColor} flex-shrink-0`} />
                      <span className="oracle-label truncate">{card.category}</span>
                    </div>
                    <span className={`text-xs font-mono border rounded-full px-2 py-0.5 flex-shrink-0 ${cfg.badge}`}>
                      {card.confidence}% conf.
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-oracle-bright font-medium text-sm leading-snug">{card.title}</p>

                  {/* Data points */}
                  <ul className="space-y-1.5">
                    {card.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-xs text-oracle-muted leading-relaxed">
                        <span className={`w-1 h-1 rounded-full ${cfg.dot} flex-shrink-0 mt-1.5`} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="oracle-label mb-3">Capabilities</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-oracle-bright mb-4">
              Your entire life, understood
            </h2>
            <p className="text-oracle-text max-w-xl mx-auto leading-relaxed">
              Six intelligence layers working together to surface the patterns your conscious mind misses.
            </p>
          </div>

          {/* 2×3 grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, bullets }) => (
              <div key={title} className="oracle-card p-6 flex flex-col gap-4 hover:border-oracle-teal/20 transition-colors duration-300 group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center group-hover:bg-oracle-teal/15 transition-colors">
                  <Icon size={20} className="text-oracle-teal" />
                </div>

                {/* Title + desc */}
                <div>
                  <h3 className="font-semibold text-oracle-bright mb-1">{title}</h3>
                  <p className="text-xs text-oracle-muted leading-relaxed">{desc}</p>
                </div>

                {/* Bullets */}
                <ul className="space-y-2 mt-auto">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-oracle-text leading-relaxed">
                      <Check size={13} className="text-oracle-teal flex-shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-oracle-border">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="oracle-label mb-3">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-oracle-bright mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-oracle-text max-w-md mx-auto">
              Start free, upgrade when Oracle proves its value. Cancel any time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free tier */}
            <div className="oracle-card p-8 flex flex-col gap-6">
              <div>
                <p className="oracle-label mb-2">Free</p>
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl font-bold text-oracle-bright">$0</span>
                  <span className="text-oracle-muted mb-1.5">/ month</span>
                </div>
                <p className="text-oracle-muted text-sm mt-2">Get a taste of your second brain.</p>
              </div>

              <ul className="space-y-3 flex-1">
                {[
                  '1 integration',
                  '5 insights per week',
                  'Basic pattern detection',
                  'Email or calendar (choose one)',
                  'Community support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-oracle-text">
                    <Check size={14} className="text-oracle-muted flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/sign-in?mode=signup" className="oracle-btn-ghost text-center text-sm">
                Start free
              </Link>
            </div>

            {/* Pro tier */}
            <div className="relative oracle-card-glow p-8 flex flex-col gap-6 border-oracle-teal/20">
              {/* Glow layer */}
              <div className="absolute inset-0 rounded-2xl bg-teal-glow pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <p className="oracle-label">Pro</p>
                  <span className="text-xs font-mono bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/30 px-2 py-0.5 rounded-full">
                    Most popular
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl font-bold text-oracle-bright">$20</span>
                  <span className="text-oracle-muted mb-1.5">/ month</span>
                </div>
                <p className="text-oracle-muted text-sm mt-2">Your full second brain, fully activated.</p>
              </div>

              <ul className="space-y-3 flex-1 relative">
                {[
                  'All integrations (email, calendar, finance, health)',
                  'Unlimited insights',
                  'Weekly intelligence report',
                  'Chat interface — ask Oracle anything',
                  'Cross-domain pattern detection',
                  'Priority email support',
                  'Cancel anytime',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-oracle-text">
                    <Check size={14} className="text-oracle-teal flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-in?mode=signup"
                className="oracle-btn-primary text-center text-sm relative inline-block"
              >
                Get Oracle Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-oracle-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="oracle-label mb-3">Testimonials</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-oracle-bright mb-4">
              What Oracle users say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role, initials }) => (
              <div key={author} className="oracle-card p-6 flex flex-col gap-5">
                {/* Quote mark */}
                <div className="text-oracle-teal font-display text-4xl leading-none select-none">&ldquo;</div>

                <p className="text-oracle-text text-sm leading-relaxed flex-1 -mt-2">{quote}</p>

                <div className="flex items-center gap-3 pt-2 border-t border-oracle-border">
                  <div className="w-9 h-9 rounded-full bg-oracle-teal/10 border border-oracle-teal/20 flex items-center justify-center">
                    <span className="text-oracle-teal font-mono text-xs font-medium">{initials}</span>
                  </div>
                  <div>
                    <p className="text-oracle-bright text-sm font-medium">{author}</p>
                    <p className="text-oracle-muted text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-oracle-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="oracle-label mb-3">FAQ</p>
            <h2 className="font-display text-4xl font-bold text-oracle-bright mb-4">
              Questions &amp; answers
            </h2>
            <p className="text-oracle-text">
              Everything you need to know before you trust us with your life data.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-oracle-border">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-oracle-card border border-oracle-teal/20 p-12 text-center">
            {/* Background glow */}
            <div className="absolute inset-0 bg-teal-glow pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-oracle-teal/50 to-transparent" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-oracle-teal/10 border border-oracle-teal/30 flex items-center justify-center">
                  <Brain size={28} className="text-oracle-teal" />
                </div>
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold text-oracle-bright mb-4">
                Ready to understand your life?
              </h2>
              <p className="text-oracle-text mb-10 max-w-md mx-auto leading-relaxed">
                Join the waitlist. Oracle is in private beta — early access members get Pro free for 3 months.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-in?mode=signup"
                  className="oracle-btn-primary inline-flex items-center gap-2 text-base px-10 py-4 glow-teal"
                >
                  Get early access — it&apos;s free <ArrowRight size={18} />
                </Link>
              </div>

              <p className="text-oracle-muted text-xs mt-6 font-mono">
                No credit card required · Cancel anytime · Your data stays yours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-oracle-border px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-oracle-teal/10 border border-oracle-teal/30 flex items-center justify-center">
              <span className="text-oracle-teal font-display font-bold text-sm leading-none">O</span>
            </div>
            <span className="font-display font-semibold text-oracle-bright">Oracle</span>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-6 text-sm text-oracle-muted">
            <Link href="#" className="hover:text-oracle-text transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-oracle-text transition-colors">Terms</Link>
            <Link href="#" className="hover:text-oracle-text transition-colors">Security</Link>
            <Link href="#" className="hover:text-oracle-text transition-colors">Blog</Link>
            <Link href="/sign-in" className="hover:text-oracle-text transition-colors">Sign in</Link>
          </nav>

          {/* Copyright */}
          <p className="text-oracle-muted text-xs font-mono">
            © 2026 Oracle. Built with Claude AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
