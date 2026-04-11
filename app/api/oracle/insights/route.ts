// ─────────────────────────────────────────────────────────────────
// GET /api/oracle/insights  — fetch user insights
// PATCH /api/oracle/insights  — mark insight as read/dismissed
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit    = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('oracle_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ insights: data || [] });
  } catch (error) {
    console.error('[Insights GET]', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, read, dismissed } = await req.json();
    if (!id) return NextResponse.json({ error: 'Insight ID required' }, { status: 400 });

    const updates: Record<string, boolean> = {};
    if (read !== undefined)      updates.read = read;
    if (dismissed !== undefined) updates.dismissed = dismissed;

    const { error } = await supabase
      .from('oracle_insights')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Insights PATCH]', error);
    return NextResponse.json({ error: 'Failed to update insight' }, { status: 500 });
  }
}
