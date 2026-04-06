// POST /api/plaid/exchange
// Exchanges Plaid public_token for access_token, syncs transactions.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exchangePublicToken, fetchTransactions } from '@/lib/plaid';
import { createAccount, upsertTransactions } from '@/lib/db';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { public_token, institution_name, account_name, account_type, mask } = await req.json();

  try {
    const { access_token, item_id } = await exchangePublicToken(public_token);

    // Save connected account (access_token encrypted at rest by Supabase Vault in production)
    const account = await createAccount({
      user_id:          user.id,
      plaid_item_id:    item_id,
      institution_name,
      account_name:     account_name ?? institution_name,
      account_type:     account_type ?? 'checking',
      mask,
      last_synced:      new Date().toISOString(),
      is_active:        true,
    } as Parameters<typeof createAccount>[0]);

    // Sync 90 days of transactions
    const transactions = await fetchTransactions(access_token, account.id, user.id);
    await upsertTransactions(transactions);

    return NextResponse.json({ success: true, account, transactionCount: transactions.length });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
