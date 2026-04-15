import Link from 'next/link';
import { DEMO_ISSUES, DEMO_ACCOUNTS, DEMO_TOTAL_SAVED } from '@/lib/demo-data';
import { ShieldAlert, TrendingUp, MessageCircle, ChevronRight, Building2, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const openIssues   = DEMO_ISSUES.filter((i) => i.status === 'new' || i.status === 'in_progress');
  const monthlyLeak  = openIssues.reduce((s, i) => s + i.monthly_cost, 0);
  const annualLeak   = openIssues.reduce((s, i) => s + i.annual_cost, 0);
  const topIssues    = openIssues.slice(0, 3);

  const fmt  = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const fmt2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="keeper-label mb-1">Keeper · Money Intelligence</p>
          <h1 className="text-2xl font-bold text-keeper-bright">Dashboard</h1>
        </div>
        <button className="keeper-btn-ghost flex items-center gap-2 text-xs">
          <RefreshCw size={13} /> Re-scan
        </button>
      </div>

      {/* Hero card */}
      <div className="keeper-card-hero p-7">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full bg-keeper-green animate-pulse-slow" />
          <span className="keeper-label text-keeper-green/80">Keeper is watching</span>
        </div>

        {openIssues.length > 0 ? (
          <>
            <p className="text-keeper-text text-sm mb-1">
              Found across {openIssues.length} open issue{openIssues.length !== 1 ? 's' : ''}
            </p>
            <p className="text-5xl font-black text-keeper-bright tracking-tight">
              {fmt(annualLeak)}
              <span className="text-xl font-normal text-keeper-muted ml-2">/year</span>
            </p>
            <p className="text-keeper-text text-sm mt-1">leaking from your accounts unnecessarily</p>
          </>
        ) : (
          <p className="text-2xl font-bold text-keeper-bright">All clear — no issues found</p>
        )}

        {/* Stats row */}
        <div className="mt-6 pt-5 border-t border-keeper-border/60 grid grid-cols-3 gap-4">
          <div>
            <p className="keeper-label mb-1">Monthly leak</p>
            <p className="text-keeper-red text-xl font-black">{fmt2(monthlyLeak)}</p>
          </div>
          <div>
            <p className="keeper-label mb-1">Total saved</p>
            <p className="text-keeper-green text-xl font-black">{fmt(DEMO_TOTAL_SAVED)}</p>
          </div>
          <div>
            <p className="keeper-label mb-1">Open issues</p>
            <p className="text-keeper-bright text-xl font-black">{openIssues.length}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/findings', icon: ShieldAlert,   label: 'View Findings',  sub: `${openIssues.length} need action`,     color: 'text-keeper-red',   bg: 'bg-red-500/10'           },
          { href: '/chat',     icon: MessageCircle, label: 'Ask Keeper AI',  sub: 'Get financial advice',                  color: 'text-keeper-green', bg: 'bg-keeper-green/10'      },
          { href: '/invest',   icon: TrendingUp,    label: 'Invest Surplus', sub: `${fmt(Math.max(0, 200 - monthlyLeak))}/mo available`, color: 'text-blue-400',  bg: 'bg-blue-500/10' },
        ].map(({ href, icon: Icon, label, sub, color, bg }) => (
          <Link key={href} href={href}>
            <div className="keeper-card p-4 hover:border-keeper-green/30 transition-colors cursor-pointer">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-keeper-bright text-sm font-semibold">{label}</p>
              <p className="text-keeper-muted text-xs mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Top issues */}
      {topIssues.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-keeper-bright font-semibold">Top Issues</h2>
            <Link href="/findings" className="text-keeper-green text-sm font-medium flex items-center gap-1 hover:text-keeper-green-dim transition-colors">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-2">
            {topIssues.map((issue) => (
              <Link key={issue.id} href={`/findings/${issue.id}`}>
                <div className="keeper-card px-4 py-3.5 flex items-center gap-4 hover:border-keeper-green/20 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-keeper-bright text-sm font-semibold truncate">{issue.merchant_name}</p>
                    <p className="text-keeper-muted text-xs mt-0.5 truncate">{issue.plain_english_explanation.slice(0, 70)}…</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-keeper-red font-bold text-sm">{fmt2(issue.monthly_cost)}<span className="text-xs font-normal text-keeper-muted">/mo</span></p>
                    <p className="keeper-label">{fmt(issue.annual_cost)}/yr</p>
                  </div>
                  <ChevronRight size={14} className="text-keeper-muted shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Connected accounts */}
      {DEMO_ACCOUNTS.length > 0 && (
        <div>
          <h2 className="text-keeper-bright font-semibold mb-3">Connected Accounts</h2>
          <div className="flex gap-3 flex-wrap">
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.id} className="keeper-card px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-keeper-green/10 flex items-center justify-center">
                  <Building2 size={15} className="text-keeper-green" />
                </div>
                <div>
                  <p className="text-keeper-bright text-sm font-medium">{account.institution_name}</p>
                  <p className="keeper-label">{account.account_name} ••••{account.mask}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
