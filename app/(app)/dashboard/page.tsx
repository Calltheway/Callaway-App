import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMockOracleData } from '@/lib/oracle';
import { LifeScoreGauge } from './LifeScoreGauge';
import { WeeklyReportCard } from './WeeklyReportCard';
import { OracleFeed } from './OracleFeed';
import { PatternAlerts } from './PatternAlerts';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // ── Auth guard ──────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  // ── Oracle data ─────────────────────────────────────────────────
  const oracle = getMockOracleData();

  // ── Derived display values ───────────────────────────────────────
  const rawName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'there';

  const firstName = rawName.split(' ')[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weekOf = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const alertCount = oracle.insights.filter((i) => i.severity === 'alert').length;

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex items-end justify-between">
        <div>
          <p className="oracle-label mb-2">Oracle Intelligence Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-oracle-bright">
            {greeting},{' '}
            <span className="text-gradient-teal">{firstName}</span>
          </h1>
          <p className="text-oracle-muted text-sm mt-1">Your Oracle Summary</p>
        </div>

        <div className="text-right shrink-0 ml-6">
          <p className="oracle-label">{todayLabel}</p>
          <p className="text-oracle-teal font-mono text-xs mt-1 flex items-center justify-end gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-oracle-teal animate-pulse-slow" />
            ORACLE ACTIVE
          </p>
          {alertCount > 0 && (
            <p className="font-mono text-xs text-oracle-crimson mt-1">
              {alertCount} urgent alert{alertCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </header>

      {/* ── Life Score (1/3) + Weekly Report (2/3) ───────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <LifeScoreGauge
            overall={oracle.life_score.overall}
            financial={oracle.life_score.financial}
            social={oracle.life_score.social}
            health={oracle.life_score.health}
            productivity={oracle.life_score.productivity}
            emotional={oracle.life_score.emotional}
            growth={oracle.life_score.growth}
          />
        </div>
        <div className="col-span-2">
          <WeeklyReportCard
            summary={oracle.weekly_summary}
            weekOf={weekOf}
          />
        </div>
      </div>

      {/* ── Oracle Feed (2/3) + Pattern Alerts (1/3) ─────────────── */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <OracleFeed insights={oracle.insights} />
        </div>
        <div className="col-span-1">
          <PatternAlerts patterns={oracle.patterns} />
        </div>
      </div>

    </div>
  );
}
