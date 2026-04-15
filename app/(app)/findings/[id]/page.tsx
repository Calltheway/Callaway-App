'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_ISSUES } from '@/lib/demo-data';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { notFound } from 'next/navigation';

const ISSUE_LABELS: Record<string, string> = {
  forgotten_subscription: 'Forgotten Subscription',
  price_increase:         'Price Increase',
  duplicate_charge:       'Duplicate Charge',
  unused_subscription:    'Unused Subscription',
  overpriced_service:     'Overpriced Service',
  unclaimed_refund:       'Unclaimed Refund',
  warranty_expiring:      'Warranty Expiring',
  billing_error:          'Billing Error',
  free_trial_ending:      'Free Trial Ending',
};

const DIFFICULTY: Record<string, { label: string; desc: string; bars: number }> = {
  easy:   { label: 'Easy',   desc: 'Takes less than 2 minutes',    bars: 1 },
  medium: { label: 'Medium', desc: 'Takes about 5–10 minutes',     bars: 2 },
  hard:   { label: 'Hard',   desc: 'May require a call or letter', bars: 3 },
};

export default function FindingDetailPage({ params }: { params: { id: string } }) {
  const issue = DEMO_ISSUES.find((i) => i.id === params.id);
  if (!issue) notFound();

  const [copied, setCopied]   = useState(false);
  const [resolved, setResolved] = useState(false);
  const router = useRouter();

  const fmt  = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  const diff = DIFFICULTY[issue.action_difficulty] ?? DIFFICULTY.medium;

  const demoScript = `Hi, I'm a long-time ${issue.merchant_name} customer and I noticed my bill increased recently. I'd like to discuss options to lower my rate or I may need to cancel. Can you help me with that?`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(demoScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = () => {
    setResolved(true);
    setTimeout(() => router.push('/findings'), 1500);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/findings" className="inline-flex items-center gap-1.5 text-keeper-muted hover:text-keeper-bright text-sm font-medium transition-colors">
        <ArrowLeft size={15} /> Back to Findings
      </Link>

      {/* Header */}
      <div className="keeper-card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="keeper-label mb-1">{ISSUE_LABELS[issue.issue_type]}</p>
            <h1 className="text-2xl font-bold text-keeper-bright">{issue.merchant_name}</h1>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${
            issue.status === 'new'         ? 'badge-new'      :
            issue.status === 'in_progress' ? 'badge-progress' :
            issue.status === 'resolved'    ? 'badge-resolved' : 'badge-dismissed'
          }`}>
            {issue.status === 'in_progress' ? 'In Progress' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-keeper-surface rounded-xl p-4 border border-keeper-border">
            <p className="keeper-label mb-1">Monthly cost</p>
            <p className="text-2xl font-black text-keeper-green">{fmt(issue.monthly_cost)}</p>
          </div>
          <div className="bg-keeper-surface rounded-xl p-4 border border-keeper-border">
            <p className="keeper-label mb-1">Annual cost</p>
            <p className="text-2xl font-black text-keeper-bright">{fmt(issue.annual_cost)}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="keeper-card p-6">
        <h2 className="font-semibold text-keeper-bright mb-3">What Keeper Found</h2>
        <p className="text-keeper-text leading-relaxed">{issue.plain_english_explanation}</p>
        <div className="mt-4 flex items-center gap-2 bg-keeper-surface rounded-xl px-4 py-2.5 border border-keeper-border">
          <span className="text-keeper-text text-sm">Confidence:</span>
          <span className="font-semibold text-keeper-green text-sm">{Math.round(issue.confidence_score * 100)}%</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="keeper-card p-6">
        <h2 className="font-semibold text-keeper-bright mb-4">How hard is this to fix?</h2>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((bar) => (
            <div key={bar} className={`h-2 flex-1 rounded-full ${bar <= diff.bars ? 'bg-keeper-green' : 'bg-keeper-border'}`} />
          ))}
        </div>
        <p className="text-sm text-keeper-text">
          <span className="font-semibold text-keeper-bright">{diff.label}</span> — {diff.desc}
        </p>
      </div>

      {/* Negotiation script */}
      {issue.recommended_action === 'negotiate' && (
        <div className="keeper-card p-6">
          <h2 className="font-semibold text-keeper-bright mb-3">Negotiation Script</h2>
          <div className="bg-keeper-surface rounded-xl p-4 border border-keeper-border text-keeper-text text-sm leading-relaxed mb-3">
            {demoScript}
          </div>
          <button onClick={handleCopy} className="keeper-btn-secondary flex items-center gap-2">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Script'}
          </button>
        </div>
      )}

      {/* Actions */}
      {issue.status !== 'resolved' ? (
        <div className="space-y-3">
          {resolved ? (
            <div className="keeper-card p-5 text-center border-keeper-green/30">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-keeper-green">Issue resolved!</p>
              <p className="text-keeper-text text-sm mt-1">{fmt(issue.monthly_cost)}/month saved. Redirecting…</p>
            </div>
          ) : (
            <>
              <button onClick={handleResolve} className="keeper-btn-primary w-full justify-center gap-2">
                ✓ Mark as Resolved — save {fmt(issue.monthly_cost)}/mo
              </button>
              <Link href="/findings">
                <button className="keeper-btn-ghost w-full justify-center text-sm">Dismiss</button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="keeper-card p-5 flex items-center gap-4 border-keeper-green/30">
          <span className="text-3xl">✅</span>
          <div>
            <p className="font-bold text-keeper-green">Resolved!</p>
            {issue.amount_saved && (
              <p className="text-keeper-text text-sm">You saved {fmt(issue.amount_saved)}/month</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
