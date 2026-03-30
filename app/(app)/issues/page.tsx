import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getIssues } from '@/lib/db';
import { IssueCard } from '@/components/issues/IssueCard';
import { FilteredIssues } from './FilteredIssues';

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { filter } = await searchParams;
  const issues     = await getIssues(user.id);

  const counts = {
    all:         issues.length,
    new:         issues.filter((i) => i.status === 'new').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved:    issues.filter((i) => i.status === 'resolved').length,
    dismissed:   issues.filter((i) => i.status === 'dismissed').length,
  };

  const activeFilter = filter ?? 'all';
  const filtered = activeFilter === 'all'
    ? issues
    : issues.filter((i) => i.status === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900">Issues</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {counts.new > 0
            ? `${counts.new} new issue${counts.new !== 1 ? 's' : ''} need your attention`
            : 'All caught up — Keeper is watching'}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['all',         'All'],
          ['new',         'New'],
          ['in_progress', 'In Progress'],
          ['resolved',    'Resolved'],
          ['dismissed',   'Dismissed'],
        ] as const).map(([key, label]) => {
          const count = counts[key];
          const active = activeFilter === key;
          return (
            <a
              key={key}
              href={key === 'all' ? '/issues' : `/issues?filter=${key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
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
          {filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-bold text-navy-900 mb-2">
            {activeFilter === 'all' ? 'No issues found yet' : `No ${activeFilter.replace('_', ' ')} issues`}
          </p>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            {activeFilter === 'all'
              ? 'Connect a bank account and Keeper will scan for issues automatically. Most users find something in their first scan.'
              : `You don't have any ${activeFilter.replace('_', ' ')} issues right now.`}
          </p>
        </div>
      )}
    </div>
  );
}
