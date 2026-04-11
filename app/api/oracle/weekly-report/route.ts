// ─────────────────────────────────────────────────────────────────
// POST /api/oracle/weekly-report
// Generates and saves a weekly Oracle report. Run via cron Sunday nights.
// GET /api/oracle/weekly-report  — returns latest weekly report for current user
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateWeeklyReport, getMockOracleData, type UserLifeContext } from '@/lib/oracle';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: report } = await supabase
      .from('oracle_weekly_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('week_of', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ report });
  } catch (error) {
    console.error('[Weekly Report GET]', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Pull user profile
    const { data: profile } = await supabase
      .from('oracle_users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Pull last week's scores for delta calculation
    const { data: prevScores } = await supabase
      .from('oracle_life_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('week_of', { ascending: false })
      .limit(2);

    const previousScore = prevScores && prevScores.length > 1 ? prevScores[1] : undefined;

    const context: UserLifeContext = {
      goals:       profile?.goals,
      fears:       profile?.fears,
      lifeContext: profile?.life_context,
    };

    const body = await req.json().catch(() => ({}));
    const { useMock = false } = body;

    let report;
    if (useMock) {
      const mockData = getMockOracleData();
      report = {
        summary:    mockData.weekly_summary,
        highlights: mockData.urgent_alerts.map((a) => a.title),
        patterns:   mockData.patterns.map((p) => p.name),
        score:      mockData.life_score.overall,
      };
    } else {
      report = await generateWeeklyReport(context, previousScore ? {
        overall:      previousScore.overall,
        financial:    previousScore.financial,
        social:       previousScore.social,
        health:       previousScore.health,
        productivity: previousScore.productivity,
        emotional:    previousScore.emotional,
        growth:       previousScore.growth,
      } : undefined);
    }

    const weekOf = new Date();
    weekOf.setDate(weekOf.getDate() - weekOf.getDay());

    await supabase.from('oracle_weekly_reports').upsert({
      user_id:    user.id,
      week_of:    weekOf.toISOString(),
      summary:    report.summary,
      highlights: JSON.stringify(report.highlights),
      patterns:   JSON.stringify(report.patterns),
      score:      report.score,
    }, { onConflict: 'user_id,week_of' });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[Weekly Report POST]', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
