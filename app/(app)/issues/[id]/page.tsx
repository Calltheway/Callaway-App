import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getIssueById } from '@/lib/db';
import { DEMO_ISSUES } from '@/lib/demo-data';
import { StatusBadge } from '@/components/ui/Badge';
import { IssueActions } from './IssueActions';
import { ArrowLeft } from 'lucide-react';
import type { DetectedIssue } from '@/types';

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

async function loadIssue(id: string): Promise<DetectedIssue | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return getIssueById(id);
  } catch {
    // Supabase not configured — fall through to demo data
  }
  return DEMO_ISSUES.find((i) => i.id === id) ?? null;
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue  = await loadIssue(id);
  if (!issue) notFound();

  const fmt  = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  const diff = DIFFICULTY[issue.action_difficulty] ?? DIFFICULTY.medium;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Link
        href="/issues"
        className="inline-flex items-center gap-1.5 text-oracle-muted hover:text-oracle-bright text-sm font-medium transition-colors"
      >
        <ArrowLeft size={16} /> Back to Issues
      </Link>

      {/* Header card */}
      <div className="oracle-card p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="oracle-label mb-1">{ISSUE_LABELS[issue.issue_type]}</p>
            <h1 className="text-2xl font-black text-oracle-bright">{issue.merchant_name}</h1>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Cost breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-oracle-navy rounded-xl p-4 border border-oracle-border">
            <p className="oracle-label mb-1">Monthly cost</p>
            <p className="text-2xl font-black text-oracle-teal">{fmt(issue.monthly_cost)}</p>
          </div>
          <div className="bg-oracle-navy rounded-xl p-4 border border-oracle-border">
            <p className="oracle-label mb-1">Annual cost</p>
            <p className="text-2xl font-black text-oracle-bright">{fmt(issue.annual_cost)}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="oracle-card p-6">
        <h2 className="font-bold text-oracle-bright mb-3">What's happening</h2>
        <p className="text-oracle-text leading-relaxed">{issue.plain_english_explanation}</p>

        <div className="mt-4 flex items-center gap-2 bg-oracle-navy rounded-xl px-4 py-2.5 text-sm border border-oracle-border">
          <span className="text-oracle-muted">Oracle's confidence:</span>
          <span className="font-semibold text-oracle-teal">{Math.round(issue.confidence_score * 100)}%</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="oracle-card p-6">
        <h2 className="font-bold text-oracle-bright mb-4">How hard is this to fix?</h2>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`h-2 flex-1 rounded-full transition-colors ${
                bar <= diff.bars ? 'bg-oracle-teal' : 'bg-oracle-border'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-oracle-muted">
          <span className="font-semibold text-oracle-bright">{diff.label}</span> — {diff.desc}
        </p>
      </div>

      {/* Action area */}
      <IssueActions issue={issue} />
    </div>
  );
}
