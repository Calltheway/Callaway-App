// ─────────────────────────────────────────────────────────────────
// POST /api/integrations/health/sync
// Pull health data from stored Fitbit/Apple HealthKit data
// Analyzes: sleep, steps, HRV, workout consistency
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: integration } = await supabase
      .from('oracle_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'health')
      .single();

    if (!integration?.access_token) {
      return NextResponse.json({ error: 'Health not connected' }, { status: 400 });
    }

    await supabase.from('oracle_integrations').update({
      status: 'syncing', updated_at: new Date().toISOString(),
    }).eq('id', integration.id);

    try {
      // Fitbit API — pull sleep, activity, and heart rate data
      const today = new Date().toISOString().split('T')[0];
      const since = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const [sleepRes, activityRes, hrRes] = await Promise.all([
        fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${since}/${today}.json`, {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }),
        fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/${since}/${today}.json`, {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }),
        fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${since}/${today}.json`, {
          headers: { Authorization: `Bearer ${integration.access_token}` },
        }),
      ]);

      const [sleepData, activityData, hrData] = await Promise.all([
        sleepRes.ok ? sleepRes.json() : null,
        activityRes.ok ? activityRes.json() : null,
        hrRes.ok ? hrRes.json() : null,
      ]);

      // Process sleep data
      const sleepLogs = sleepData?.sleep || [];
      const avgSleepMin = sleepLogs.length > 0
        ? sleepLogs.reduce((s: number, d: {minutesAsleep: number}) => s + (d.minutesAsleep || 0), 0) / sleepLogs.length
        : 0;
      const avgSleepHours = Math.round((avgSleepMin / 60) * 10) / 10;

      // Process activity data
      const stepDays = activityData?.['activities-steps'] || [];
      const avgSteps = stepDays.length > 0
        ? Math.round(stepDays.reduce((s: number, d: {value: string}) => s + parseInt(d.value || '0'), 0) / stepDays.length)
        : 0;

      // Process HRV (resting heart rate as proxy)
      const hrDays = hrData?.['activities-heart'] || [];
      const restingHRValues = hrDays
        .map((d: {value: {restingHeartRate?: number}}) => d.value?.restingHeartRate)
        .filter(Boolean) as number[];
      const avgHRV = restingHRValues.length > 0
        ? Math.round(restingHRValues.reduce((s, v) => s + v, 0) / restingHRValues.length)
        : null;

      // Detect sleep trend
      const recentSleep = sleepLogs.slice(-7).map((d: {minutesAsleep: number}) => d.minutesAsleep || 0);
      const olderSleep  = sleepLogs.slice(-14, -7).map((d: {minutesAsleep: number}) => d.minutesAsleep || 0);
      const recentAvg   = recentSleep.length > 0 ? recentSleep.reduce((s: number, v: number) => s + v, 0) / recentSleep.length : 0;
      const olderAvg    = olderSleep.length > 0 ? olderSleep.reduce((s: number, v: number) => s + v, 0) / olderSleep.length : 0;
      const sleepTrend  = recentAvg > olderAvg + 10 ? 'improving' : recentAvg < olderAvg - 10 ? 'declining' : 'stable';

      const summary = {
        avgSleepHours,
        avgSteps,
        avgHRV,
        sleepTrend,
        daysAnalyzed: sleepLogs.length,
        syncedAt:     new Date().toISOString(),
      };

      await supabase.from('oracle_integrations').update({
        status:      'connected',
        last_synced: new Date().toISOString(),
        metadata:    JSON.stringify(summary),
        updated_at:  new Date().toISOString(),
      }).eq('id', integration.id);

      return NextResponse.json({ success: true, summary });

    } catch (syncError) {
      await supabase.from('oracle_integrations').update({ status: 'error', updated_at: new Date().toISOString() }).eq('id', integration.id);
      throw syncError;
    }

  } catch (error) {
    console.error('[Health Sync]', error);
    return NextResponse.json({ error: 'Health sync failed', details: String(error) }, { status: 500 });
  }
}
