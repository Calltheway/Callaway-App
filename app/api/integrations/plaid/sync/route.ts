// ─────────────────────────────────────────────────────────────────
// POST /api/integrations/plaid/sync
// Pull transactions from Plaid, categorize spending,
// detect anomalies vs historical baseline, calculate savings rate
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PlaidTransaction {
  transaction_id: string;
  name:           string;
  amount:         number;
  date:           string;
  category?:      string[];
  merchant_name?: string;
  payment_channel?: string;
}

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: integration } = await supabase
      .from('oracle_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'plaid')
      .single();

    if (!integration?.access_token) {
      return NextResponse.json({ error: 'Plaid not connected' }, { status: 400 });
    }

    await supabase.from('oracle_integrations').update({
      status: 'syncing', updated_at: new Date().toISOString(),
    }).eq('id', integration.id);

    try {
      const plaidEnv = process.env.PLAID_ENV || 'sandbox';
      const baseUrl  = plaidEnv === 'production'
        ? 'https://production.plaid.com'
        : plaidEnv === 'development'
          ? 'https://development.plaid.com'
          : 'https://sandbox.plaid.com';

      const since = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const txResponse = await fetch(`${baseUrl}/transactions/get`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          client_id:    process.env.PLAID_CLIENT_ID,
          secret:       process.env.PLAID_SECRET,
          access_token: integration.access_token,
          start_date:   since,
          end_date:     today,
          options:      { count: 500, offset: 0 },
        }),
      });

      if (!txResponse.ok) throw new Error(`Plaid API error: ${txResponse.status}`);
      const txData = await txResponse.json();
      const transactions: PlaidTransaction[] = txData.transactions || [];

      // Categorize spending
      const categoryTotals: Record<string, number> = {};
      let totalSpend  = 0;
      let incomeTotal = 0;

      for (const tx of transactions) {
        const amount = tx.amount;
        if (amount < 0) {
          // Income (negative in Plaid = money coming in)
          incomeTotal += Math.abs(amount);
          continue;
        }

        totalSpend += amount;
        const category = tx.category?.[0] || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      }

      // Top spending categories
      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }));

      // Monthly breakdown for anomaly detection
      const monthlySpend: Record<string, number> = {};
      for (const tx of transactions) {
        if (tx.amount <= 0) continue;
        const month = tx.date.substring(0, 7); // YYYY-MM
        monthlySpend[month] = (monthlySpend[month] || 0) + tx.amount;
      }

      const monthlyValues = Object.values(monthlySpend);
      const avgMonthly    = monthlyValues.length > 0
        ? monthlyValues.reduce((s, v) => s + v, 0) / monthlyValues.length
        : 0;

      // Detect anomalous merchants (spending > 2× their usual)
      const merchantSpend: Record<string, number[]> = {};
      for (const tx of transactions) {
        if (tx.amount <= 0) continue;
        const merchant = tx.merchant_name || tx.name;
        if (!merchantSpend[merchant]) merchantSpend[merchant] = [];
        merchantSpend[merchant].push(tx.amount);
      }

      const anomalies = Object.entries(merchantSpend)
        .filter(([, amounts]) => amounts.length > 1)
        .map(([merchant, amounts]) => {
          const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
          const max = Math.max(...amounts);
          return { merchant, avg, max, spike: max / avg };
        })
        .filter(({ spike }) => spike > 2.0)
        .slice(0, 5)
        .map(({ merchant, max }) => ({
          description: `${merchant} had an unusually high charge`,
          amount:      Math.round(max * 100) / 100,
        }));

      // Savings rate
      const savingsRate = incomeTotal > 0
        ? Math.round(((incomeTotal - totalSpend / 3) / incomeTotal) * 100)
        : 0;

      const summary = {
        totalTransactions: transactions.length,
        totalSpend:        Math.round(totalSpend * 100) / 100,
        monthlyAvgSpend:   Math.round(avgMonthly * 100) / 100,
        incomeDetected:    Math.round(incomeTotal * 100) / 100,
        savingsRate:       Math.max(0, Math.min(100, savingsRate)),
        topCategories,
        anomalies,
        syncedAt:          new Date().toISOString(),
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
    console.error('[Plaid Sync]', error);
    return NextResponse.json({ error: 'Plaid sync failed', details: String(error) }, { status: 500 });
  }
}
