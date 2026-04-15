import Link from 'next/link';
import { DEMO_ISSUES } from '@/lib/demo-data';
import { ChevronRight, AlertTriangle } from 'lucide-react';

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

const ACTION_LABELS: Record<string, string> = {
  cancel:    'Cancel',
  dispute:   'Dispute',
  negotiate: 'Negotiate',
  claim:     'Claim',
  review:    'Review',
  switch:    'Switch',
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   'text-keeper-green bg-keeper-green/10',
  medium: 'text-amber-400 bg-amber-400/10',
  hard:   'text-keeper-red bg-red-500/10',
};

type Filter = 'all' | 'new' | 'in_progress' | 'resolved';

export default async function FindingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = (filter ?? 'all') as Filter;

  const issues = DEMO_ISSUES;
  const counts = {
    all:         issues.filter((i) => i.status !== 'dismissed').length,
    new:         issues.filter((i) => i.status === 'new').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved:    issues.filter((i) => i.status === 'resolved').length,
  };

  const filtered = activeFilter === 'all'
    ? issues.filter((i) => i.status !== 'dismissed')
    : issues.filter((i) => i.status === activeFilter);

  const openAnnual = issues
    .filter((i) => i.status === 'new' || i.status === 'in_progress')
    .reduce((s, i) => s + i.annual_cost, 0);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const fmt2 = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="mono-label mb-1">Keeper · Findings</p>
        <h1 className="text-2xl font-bold text-keeper-bright">Findings</h1>
        <p className="text-keeper-text text-sm mt-0.5">
          {counts.new > 0
            ? `${counts.new} issue${counts.new !== 1 ? 's' : ''} need your attention`
            : 'All caught up — Keeper is watching'}
        </p>
      </div>

      {/* Savings banner */}
      {openAnnual > 0 && activeFilter !== 'resolved' && (
        <div className="glass-card-glow relative overflow-hidden px-5 py-4 flex items-center gap-4">
          <div className="orb w-40 h-40 bg-keeper-red/10 -top-10 -right-10" />
          <div className="relative w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-keeper-red" />
          </div>
          <div className="relative">
            <p className="mono-label mb-0.5">Potential annual savings</p>
            <p className="text-keeper-red text-2xl font-black">{fmt(openAnnual)}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['all',         'All',         counts.all],
          ['new',         'New',         counts.new],
          ['in_progress', 'In Progress', counts.in_progress],
          ['resolved',    'Resolved',    counts.resolved],
        ] as const).map(([key, label, count]) => {
          const active = activeFilter === key;
          return (
            <a
              key={key}
              href={key === 'all' ? '/findings' : `/findings?filter=${key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                active
                  ? 'bg-keeper-green text-keeper-void border-keeper-green shadow-glow-sm'
                  : 'bg-keeper-card/60 backdrop-blur-sm text-keeper-text border-keeper-border hover:border-keeper-green/40 hover:text-keeper-bright'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-keeper-void/30 text-keeper-void' : 'bg-keeper-border text-keeper-muted'
                }`}>
                  {count}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Issue list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <Link key={issue.id} href={`/findings/${issue.id}`}>
              <div className="glass-card card-hover p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-keeper-bright font-semibold truncate">{issue.merchant_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        issue.status === 'new'         ? 'badge-new'       :
                        issue.status === 'in_progress' ? 'badge-progress'  :
                        issue.status === 'resolved'    ? 'badge-resolved'  : 'badge-dismissed'
                      }`}>
                        {issue.status === 'in_progress' ? 'In Progress' : issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                    </div>
                    <p className="mono-label mb-2">{ISSUE_LABELS[issue.issue_type]}</p>
                    <p className="text-keeper-text text-sm line-clamp-2 leading-relaxed">
                      {issue.plain_english_explanation}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-keeper-red font-black text-lg">{fmt2(issue.monthly_cost)}<span className="text-xs font-normal text-keeper-muted">/mo</span></p>
                    <p className="mono-label">{fmt(issue.annual_cost)}/yr</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-keeper-border/50 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLOR[issue.action_difficulty]}`}>
                    {ACTION_LABELS[issue.recommended_action]} · {issue.action_difficulty}
                  </span>
                  <ChevronRight size={15} className="text-keeper-muted" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-keeper-green/10 border border-keeper-green/20 flex items-center justify-center mx-auto mb-4">
            <ChevronRight size={20} className="text-keeper-green" />
          </div>
          <p className="font-bold text-keeper-bright mb-2">
            {activeFilter === 'resolved' ? 'Nothing resolved yet' : 'No issues found'}
          </p>
          <p className="text-keeper-text text-sm max-w-sm mx-auto">
            {activeFilter === 'resolved'
              ? "When you fix an issue it'll show up here."
              : 'Connect a bank account and Keeper will scan automatically.'}
          </p>
        </div>
      )}
    </div>
  );
}
