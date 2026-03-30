import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getIssueById } from '@/lib/db';
import { StatusBadge } from '@/components/ui/Badge';
import { IssueActions } from './IssueActions';
import { ArrowLeft } from 'lucide-react';

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

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { id } = await params;
  const issue  = await getIssueById(id);
  if (!issue) notFound();

  const fmt  = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  const diff = DIFFICULTY[issue.action_difficulty] ?? DIFFICULTY.medium;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <Link href="/issues" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-navy-900 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Issues
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-navy-900 mb-1">{issue.merchant_name}</h1>
            <p className="text-slate-500 text-sm">{ISSUE_LABELS[issue.issue_type]}</p>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Cost breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-navy-900 rounded-xl p-4">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Monthly cost</p>
            <p className="text-2xl font-black text-emerald-400">{fmt(issue.monthly_cost)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Annual cost</p>
            <p className="text-2xl font-black text-navy-900">{fmt(issue.annual_cost)}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-navy-900 mb-3">What's happening</h2>
        <p className="text-slate-600 leading-relaxed">{issue.plain_english_explanation}</p>

        <div className="mt-4 flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-slate-500">
          <span>Keeper's confidence:</span>
          <span className="font-semibold text-navy-900">{Math.round(issue.confidence_score * 100)}%</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-bold text-navy-900 mb-4">How hard is this to fix?</h2>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3].map((bar) => (
            <div key={bar} className={`h-2 flex-1 rounded-full ${bar <= diff.bars ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          ))}
        </div>
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-navy-900">{diff.label}</span> — {diff.desc}
        </p>
      </div>

      {/* Action area (client component for interactivity) */}
      <IssueActions issue={issue} />
    </div>
  );
}
