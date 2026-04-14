import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import type { DetectedIssue } from '@/types';

const ISSUE_BORDER: Record<string, string> = {
  forgotten_subscription: 'border-red-500/30',
  price_increase:         'border-orange-500/30',
  duplicate_charge:       'border-red-500/30',
  unused_subscription:    'border-orange-500/30',
  overpriced_service:     'border-amber-500/30',
  unclaimed_refund:       'border-oracle-teal/30',
  warranty_expiring:      'border-blue-500/30',
  billing_error:          'border-red-500/30',
  free_trial_ending:      'border-purple-500/30',
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

  const borderColor = ISSUE_BORDER[issue.issue_type] ?? 'border-oracle-border';

  return (
    <Link href={`/issues/${issue.id}`}>
      <div className={`bg-oracle-card border rounded-2xl p-5 hover:shadow-oracle-card transition-shadow cursor-pointer ${borderColor}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-oracle-bright truncate">{issue.merchant_name}</h3>
              <StatusBadge status={issue.status} />
            </div>
            <p className="oracle-label mb-2">{ISSUE_LABELS[issue.issue_type]}</p>
            <p className="text-sm text-oracle-text line-clamp-2 leading-relaxed">
              {issue.plain_english_explanation}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="text-lg font-black text-oracle-crimson">
              {fmt(issue.monthly_cost)}
              <span className="text-xs font-normal text-oracle-muted">/mo</span>
            </p>
            <p className="oracle-label">{fmt(issue.annual_cost)}/yr</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-oracle-border flex items-center justify-between">
          <span className="text-xs font-medium text-oracle-teal bg-oracle-teal/10 px-2 py-1 rounded-full">
            {DIFFICULTY_LABEL[issue.action_difficulty]}
          </span>
          <ChevronRight size={16} className="text-oracle-muted" />
        </div>
      </div>
    </Link>
  );
}
