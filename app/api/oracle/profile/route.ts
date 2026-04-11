// ─────────────────────────────────────────────────────────────────
// GET /api/oracle/profile   — get user profile
// PUT /api/oracle/profile   — update user profile (goals, context)
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile, error } = await supabase
      .from('oracle_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('[Profile GET]', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      goals, fears, lifeContext,
      notificationPreferences,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (goals !== undefined)                  updates.goals = goals;
    if (fears !== undefined)                  updates.fears = fears;
    if (lifeContext !== undefined)            updates.life_context = lifeContext;
    if (notificationPreferences !== undefined) updates.notification_preferences = notificationPreferences;

    // Upsert: create profile if it doesn't exist
    const { data, error } = await supabase
      .from('oracle_users')
      .upsert({
        id:        user.id,
        email:     user.email!,
        name:      user.user_metadata?.full_name || user.email?.split('@')[0],
        ...updates,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('[Profile PUT]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
