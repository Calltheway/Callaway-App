import { TrendingDown, CheckCircle } from 'lucide-react';

interface HeroCardProps {
  issueCount:     number;
  monthlyCost:    number;
  savedThisMonth: number;
}

export function HeroCard({ issueCount, monthlyCost, savedThisMonth }: HeroCardProps) {
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-white">
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Keeper is watching</span>
      </div>

      {issueCount > 0 ? (
        <>
          <p className="text-white/70 text-sm mb-1">Found in {issueCount} {issueCount === 1 ? 'issue' : 'issues'}</p>
          <p className="text-4xl font-black tracking-tight">
            {fmt(monthlyCost)}
            <span className="text-lg font-normal text-white/50 ml-1">/month</span>
          </p>
          <p className="text-white/60 text-sm mt-1">costing you money unnecessarily</p>
        </>
      ) : (
        <>
          <p className="text-2xl font-bold">Scanning your accounts...</p>
          <p className="text-white/60 text-sm mt-1">Connect a bank to see results</p>
        </>
      )}

      <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-1">Saved this month</p>
          <p className="text-emerald-400 text-2xl font-black">{fmt(savedThisMonth)}</p>
        </div>
        {savedThisMonth > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
            <CheckCircle size={12} />
            Keeper recovered this
          </div>
        )}
      </div>
    </div>
  );
}
