// ─────────────────────────────────────────────────────────────────
// POST /api/oracle/analyze
// Runs full life analysis using Claude. Saves result to Supabase.
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeLife, getMockOracleData, type UserLifeContext } from '@/lib/oracle';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { useMock = false } = body;

    // Pull user profile for context
    const { data: profile } = await supabase
      .from('oracle_users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Pull recent insights/data for context
    const context: UserLifeContext = {
      goals:       profile?.goals,
      fears:       profile?.fears,
      lifeContext: profile?.life_context,
    };

    // Run Oracle analysis (or use mock for demo)
    const analysis = useMock ? getMockOracleData() : await analyzeLife(context);

    // Save life score to Supabase
    const weekOf = new Date();
    weekOf.setDate(weekOf.getDate() - weekOf.getDay()); // Start of current week

    await supabase.from('oracle_life_scores').upsert({
      user_id:      user.id,
      overall:      analysis.life_score.overall,
      financial:    analysis.life_score.financial,
      social:       analysis.life_score.social,
      health:       analysis.life_score.health,
      productivity: analysis.life_score.productivity,
      emotional:    analysis.life_score.emotional,
      growth:       analysis.life_score.growth,
      week_of:      weekOf.toISOString(),
    }, { onConflict: 'user_id,week_of' });

    // Save insights to Supabase
    if (analysis.insights.length > 0) {
      const insightRows = analysis.insights.map((insight) => ({
        user_id:     user.id,
        category:    insight.category,
        severity:    insight.severity,
        title:       insight.title,
        content:     insight.content,
        confidence:  insight.confidence,
        data_points: JSON.stringify(insight.dataPoints),
        action:      insight.action,
        action_type: insight.actionType,
        created_at:  new Date().toISOString(),
      }));

      await supabase.from('oracle_insights').insert(insightRows);
    }

    // Save weekly summary
    if (analysis.weekly_summary) {
      await supabase.from('oracle_weekly_reports').upsert({
        user_id:   user.id,
        week_of:   weekOf.toISOString(),
        summary:   analysis.weekly_summary,
        patterns:  JSON.stringify(analysis.patterns),
        highlights: JSON.stringify(analysis.urgent_alerts.map((a) => a.title)),
        score:     analysis.life_score.overall,
      }, { onConflict: 'user_id,week_of' });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('[Oracle Analyze]', error);
    return NextResponse.json(
      { error: 'Oracle analysis failed', details: String(error) },
      { status: 500 },
    );
  }
}
