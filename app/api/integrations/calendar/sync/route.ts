// ─────────────────────────────────────────────────────────────────
// POST /api/integrations/calendar/sync
// Pull Google Calendar events, detect patterns:
// cancelled events, meeting load, social vs work balance, sleep inference
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: integration } = await supabase
      .from('oracle_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'calendar')
      .single();

    if (!integration?.access_token) {
      return NextResponse.json({ error: 'Calendar not connected' }, { status: 400 });
    }

    await supabase.from('oracle_integrations').update({
      status: 'syncing', updated_at: new Date().toISOString(),
    }).eq('id', integration.id);

    try {
      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      const until = new Date().toISOString();

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(since)}&timeMax=${encodeURIComponent(until)}&` +
        `showDeleted=true&singleEvents=true&maxResults=500&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${integration.access_token}` } },
      );

      if (!response.ok) throw new Error(`Calendar API error: ${response.status}`);
      const data = await response.json();
      const events = data.items || [];

      // Analyze events
      let totalEvents = 0;
      let cancelledEvents = 0;
      let socialEvents = 0;
      let workMeetings = 0;
      const weekdayEventCounts: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun=0
      const hourDistribution: number[] = new Array(24).fill(0);

      const SOCIAL_KEYWORDS = ['lunch', 'dinner', 'coffee', 'birthday', 'party', 'happy hour', 'catch up', 'hangout', 'friend'];
      const WORK_KEYWORDS = ['meeting', 'standup', 'sync', '1:1', 'review', 'interview', 'call', 'sprint', 'planning'];

      for (const event of events) {
        if (event.status === 'cancelled') { cancelledEvents++; continue; }
        totalEvents++;

        const title = (event.summary || '').toLowerCase();
        const start = new Date(event.start?.dateTime || event.start?.date);

        weekdayEventCounts[start.getDay()]++;
        hourDistribution[start.getHours()]++;

        if (SOCIAL_KEYWORDS.some((kw) => title.includes(kw))) socialEvents++;
        if (WORK_KEYWORDS.some((kw) => title.includes(kw))) workMeetings++;
      }

      // Infer sleep from calendar gaps (latest evening event → earliest morning event)
      const avgEveningEnd = 21; // 9pm fallback
      const avgMorningStart = hourDistribution.slice(5, 10).indexOf(
        Math.max(...hourDistribution.slice(5, 10)),
      ) + 5;
      const inferredSleep = Math.max(0, 24 - avgEveningEnd + avgMorningStart);

      // Meeting load score (0-100, higher = more overloaded)
      const avgMeetingsPerDay = workMeetings / 90;
      const meetingLoadScore = Math.min(100, Math.round(avgMeetingsPerDay * 25));

      const summary = {
        totalEvents,
        cancelledEvents,
        cancellationRate: totalEvents > 0 ? Math.round((cancelledEvents / (totalEvents + cancelledEvents)) * 100) : 0,
        socialEvents,
        workMeetings,
        socialWorkRatio: workMeetings > 0 ? Math.round((socialEvents / workMeetings) * 100) : 0,
        meetingLoadScore,
        inferredAvgSleep: inferredSleep,
        busiestDay:       ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][weekdayEventCounts.indexOf(Math.max(...weekdayEventCounts))],
        syncedAt:         new Date().toISOString(),
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
    console.error('[Calendar Sync]', error);
    return NextResponse.json({ error: 'Calendar sync failed', details: String(error) }, { status: 500 });
  }
}
