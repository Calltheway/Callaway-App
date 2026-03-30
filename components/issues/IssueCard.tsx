import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import type { DetectedIssue } from '@/types';

const ISSUE_COLORS: Record<string, string> = {
  forgotten_subscription: 'bg-red-50 border-red-200',
  price_increase:         'bg-orange-50 border-orange-200',
  duplicate_charge:       'bg-red-50 border-red-200',
  unused_subscription:    'bg-orange-50 border-orange-200',
  overpriced_service:     'bg-amber-50 border-amber-200',
  unclaimed_refund:       'bg-emerald-50 border-emerald-200',
  warranty_expiring:      'bg-blue-50 border-blue-200',
  billing_error:          'bg-red-50 border-red-200',
  free_trial_ending:      'bg-purple-50 border-purple-200',
};

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

const DIFFICULTY_LABEL: Record<string, string> = {
  easy:   '✓ Easy fix',
  medium: '~ 5 min',
  hard:   '○ Takes effort',
};

export function IssueCard({ issue }: { issue: DetectedIssue }) {
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const cardColor = ISSUE_COLORS[issue.issue_type] ?? 'bg-white border-slate-200';

  return (
    <Link href={`/issues/${issue.id}`}>
      <div className={`border rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer ${cardColor}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-navy-900 truncate">{issue.merchant_name}</h3>
              <StatusBadge status={issue.status} />
            </div>
            <p className="text-xs text-slate-500 mb-2">{ISSUE_LABELS[issue.issue_type]}</p>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {issue.plain_english_explanation}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-lg font-black text-red-600">{fmt(issue.monthly_cost)}<span className="text-xs font-normal text-slate-400">/mo</span></p>
            <p className="text-xs text-slate-400">{fmt(issue.annual_cost)}/yr</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
            {DIFFICULTY_LABEL[issue.action_difficulty]}
          </span>
          <ChevronRight size={16} className="text-slate-400" />
        </div>
      </div>
    </Link>
  );
}
