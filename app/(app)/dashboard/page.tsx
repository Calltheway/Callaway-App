import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  getIssues, getAccounts, getTotalSaved, getThisMonthSaved,
} from '@/lib/db';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { IssueCard } from '@/components/issues/IssueCard';
import { RefreshButton } from './RefreshButton';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const [issues, accounts, totalSaved, thisMonthSaved] = await Promise.all([
    getIssues(user.id),
    getAccounts(user.id),
    getTotalSaved(user.id),
    getThisMonthSaved(user.id),
  ]);

  const openIssues   = issues.filter((i) => i.status === 'new' || i.status === 'in_progress');
  const monthlyCost  = openIssues.reduce((s, i) => s + i.monthly_cost, 0);
  const topIssues    = [...openIssues]
    .sort((a, b) => b.monthly_cost * b.confidence_score - a.monthly_cost * a.confidence_score)
    .slice(0, 3);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {accounts.length === 0
              ? 'Connect a bank account to start scanning'
              : `${accounts.length} account${accounts.length !== 1 ? 's' : ''} connected · Last scan: just now`}
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Hero card */}
      <HeroCard issueCount={openIssues.length} monthlyCost={monthlyCost} savedThisMonth={thisMonthSaved} />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open issues',  value: String(openIssues.length),                     color: 'text-red-600' },
          { label: 'Resolved',     value: String(issues.filter((i) => i.status === 'resolved').length), color: 'text-emerald-600' },
          { label: 'Total saved',  value: fmt(totalSaved),                                color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top opportunities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy-900">Top opportunities</h2>
          {issues.length > 3 && (
            <Link href="/issues" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700">
              See all {issues.length} →
            </Link>
          )}
        </div>

        {topIssues.length > 0 ? (
          <div className="space-y-3">
            {topIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">🏦</p>
            <p className="font-bold text-navy-900 mb-2">Connect a bank to get started</p>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Keeper needs access to your transactions to find money you're losing. Most users find $200–$400/month on their first scan.
            </p>
            <Link
              href="/onboarding/connect-bank"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Connect bank account
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">✓</p>
            <p className="font-bold text-navy-900 mb-2">All clear for now</p>
            <p className="text-slate-500 text-sm">Keeper scans daily. You'll be notified when new issues are found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
