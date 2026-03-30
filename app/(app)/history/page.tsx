import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSavingsHistory, getTotalSaved, getThisMonthSaved } from '@/lib/db';
import { format } from 'date-fns';
import { ShareButton } from './ShareButton';

const METHOD_CONFIG = {
  cancellation:   { label: 'Cancelled',        emoji: '✂️', color: 'bg-red-50 text-red-600'     },
  negotiation:    { label: 'Negotiated',        emoji: '📞', color: 'bg-emerald-50 text-emerald-600' },
  dispute_won:    { label: 'Dispute Won',       emoji: '⚖️', color: 'bg-blue-50 text-blue-600'   },
  refund_claimed: { label: 'Refund Claimed',    emoji: '💰', color: 'bg-emerald-50 text-emerald-600' },
  manual:         { label: 'Manually Resolved', emoji: '✓',  color: 'bg-slate-50 text-slate-600'  },
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
      <h1 className="text-2xl font-black text-navy-900">Savings History</h1>

      {/* Total saved card */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-7 text-white shadow-lg shadow-emerald-200">
        <p className="text-emerald-100/80 text-sm uppercase tracking-wider font-medium mb-2">Total saved with Keeper</p>
        <p className="text-5xl font-black mb-1">{fmt(totalSaved)}</p>
        <p className="text-emerald-100/70 text-sm">{fmt(thisMonthSaved)} saved this month</p>

        {totalSaved > 0 && (
          <div className="mt-5 pt-5 border-t border-white/20">
            <ShareButton amount={totalSaved} />
          </div>
        )}
      </div>

      {/* History list */}
      <div>
        <h2 className="font-bold text-navy-900 mb-4">Transaction history</h2>

        {history.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {history.map((event) => {
              const method = METHOD_CONFIG[event.method as keyof typeof METHOD_CONFIG] ?? METHOD_CONFIG.manual;
              return (
                <div key={event.id} className="flex items-center gap-4 p-5">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${method.color.split(' ')[0]}`}>
                    {method.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 truncate">{event.merchant_name}</p>
                    <p className="text-slate-500 text-sm truncate">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {format(new Date(event.saved_at), 'MMM d, yyyy')} · {method.label}
                    </p>
                  </div>
                  <p className="font-black text-emerald-600 text-lg shrink-0">
                    +{fmt(event.amount_saved)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📈</p>
            <p className="font-bold text-navy-900 mb-2">No savings recorded yet</p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              When Keeper helps you cancel a subscription, win a dispute, or claim a refund, it will appear here with the exact amount saved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
