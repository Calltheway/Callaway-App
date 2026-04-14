import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSavingsHistory, getTotalSaved, getThisMonthSaved } from '@/lib/db';
import { format } from 'date-fns';
import { ShareButton } from './ShareButton';

const METHOD_CONFIG = {
  cancellation:   { label: 'Cancelled',        emoji: '✂️', color: 'bg-red-900/30 text-red-400'       },
  negotiation:    { label: 'Negotiated',        emoji: '📞', color: 'bg-oracle-teal/10 text-oracle-teal' },
  dispute_won:    { label: 'Dispute Won',       emoji: '⚖️', color: 'bg-blue-900/30 text-blue-400'     },
  refund_claimed: { label: 'Refund Claimed',    emoji: '💰', color: 'bg-oracle-teal/10 text-oracle-teal' },
  manual:         { label: 'Manually Resolved', emoji: '✓',  color: 'bg-oracle-border text-oracle-muted' },
} as const;

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const [history, totalSaved, thisMonthSaved] = await Promise.all([
    getSavingsHistory(user.id),
    getTotalSaved(user.id),
    getThisMonthSaved(user.id),
  ]);

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div>
        <p className="oracle-label mb-1">Oracle Intelligence</p>
        <h1 className="text-2xl font-black text-oracle-bright">Savings History</h1>
      </div>

      {/* Total saved card */}
      <div className="oracle-card-glow p-7 relative overflow-hidden">
        <div className="absolute inset-0 bg-teal-glow opacity-30 pointer-events-none" />
        <div className="relative">
          <p className="oracle-label mb-2">Total saved with Oracle</p>
          <p className="text-5xl font-black text-oracle-bright mb-1">{fmt(totalSaved)}</p>
          <p className="text-oracle-muted text-sm">
            <span className="text-oracle-teal font-semibold">{fmt(thisMonthSaved)}</span> saved this month
          </p>

          {totalSaved > 0 && (
            <div className="mt-5 pt-5 border-t border-oracle-border">
              <ShareButton amount={totalSaved} />
            </div>
          )}
        </div>
      </div>

      {/* History list */}
      <div>
        <h2 className="font-bold text-oracle-bright mb-4">Transaction history</h2>

        {history.length > 0 ? (
          <div className="oracle-card divide-y divide-oracle-border overflow-hidden">
            {history.map((event) => {
              const method = METHOD_CONFIG[event.method as keyof typeof METHOD_CONFIG] ?? METHOD_CONFIG.manual;
              const [bgColor] = method.color.split(' ');
              return (
                <div key={event.id} className="flex items-center gap-4 p-5">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${bgColor}`}>
                    {method.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-oracle-bright truncate">{event.merchant_name}</p>
                    <p className="text-oracle-muted text-sm truncate">{event.description}</p>
                    <p className="oracle-label mt-0.5">
                      {format(new Date(event.saved_at), 'MMM d, yyyy')} · {method.label}
                    </p>
                  </div>
                  <p className="font-black text-oracle-teal text-lg shrink-0">
                    +{fmt(event.amount_saved)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="oracle-card p-12 text-center">
            <p className="text-4xl mb-3">📈</p>
            <p className="font-bold text-oracle-bright mb-2">No savings recorded yet</p>
            <p className="text-oracle-muted text-sm leading-relaxed max-w-sm mx-auto">
              When Oracle helps you cancel a subscription, win a dispute, or claim a refund, it will appear here with the exact amount saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
