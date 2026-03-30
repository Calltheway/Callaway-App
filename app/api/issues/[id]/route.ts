// PATCH /api/issues/[id]  — update issue status
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateIssueStatus, recordSavingsEvent, getIssueById } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status, amountSaved, method, description } = await req.json();

  try {
    await updateIssueStatus(id, status, amountSaved);

    if (status === 'resolved' && amountSaved && method) {
      const issue = await getIssueById(id);
      if (issue) {
        await recordSavingsEvent({
          user_id:       user.id,
          issue_id:      id,
          amount_saved:  amountSaved,
          saved_at:      new Date().toISOString(),
          method,
          merchant_name: issue.merchant_name,
          description:   description ?? `Resolved ${issue.merchant_name} issue`,
        });
        // Increment user's total_saved
        await supabase.rpc('increment_total_saved', { user_id: user.id, amount: amountSaved });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
