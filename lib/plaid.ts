// ─────────────────────────────────────────────
// KEEPER — Plaid (Server-side only)
// All Plaid calls happen in API routes — the secret
// never reaches the browser.
// ─────────────────────────────────────────────
import type { Transaction, TransactionCategory, RecurringFrequency } from '@/types';

const PLAID_BASE = process.env.PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : process.env.PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com';

async function plaidRequest<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${PLAID_BASE}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      client_id: process.env.PLAID_CLIENT_ID,
      secret:    process.env.PLAID_SECRET,
      ...body,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_message ?? 'Plaid request failed');
  }
  return res.json() as Promise<T>;
}

export async function createLinkToken(userId: string): Promise<string> {
  const data = await plaidRequest<{ link_token: string }>('/link/token/create', {
    user:          { client_user_id: userId },
    client_name:   'Keeper',
    products:      ['transactions'],
    country_codes: ['US'],
    language:      'en',
  });
  return data.link_token;
}

export async function exchangePublicToken(
  publicToken: string,
): Promise<{ access_token: string; item_id: string }> {
  return plaidRequest('/item/public_token/exchange', { public_token: publicToken });
}

export async function fetchTransactions(
  accessToken: string,
  accountId:   string,
  userId:      string,
): Promise<Omit<Transaction, 'id'>[]> {
  const endDate   = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const data = await plaidRequest<{ transactions: PlaidTx[] }>('/transactions/get', {
    access_token: accessToken,
    start_date:   startDate,
    end_date:     endDate,
    options:      { count: 500, include_personal_finance_category: true },
  });

  const normalized = data.transactions.map((tx) => ({
    user_id:              userId,
    account_id:           accountId,
    plaid_transaction_id: tx.transaction_id,
    merchant_name:        tx.merchant_name ?? tx.name,
    merchant_logo:        tx.logo_url,
    amount:               Math.abs(tx.amount),
    date:                 tx.date,
    category:             mapCategory(tx.personal_finance_category?.primary),
    is_recurring:         false,
    recurring_frequency:  undefined as RecurringFrequency | undefined,
    pending:              tx.pending,
  }));

  return detectRecurring(normalized);
}

interface PlaidTx {
  transaction_id:             string;
  merchant_name?:             string;
  name:                       string;
  amount:                     number;
  date:                       string;
  pending:                    boolean;
  logo_url?:                  string;
  personal_finance_category?: { primary: string };
}

function mapCategory(cat?: string): TransactionCategory {
  const m: Record<string, TransactionCategory> = {
    ENTERTAINMENT:       'streaming',
    GENERAL_SERVICES:    'software',
    RECREATION:          'fitness',
    FOOD_AND_DRINK:      'food',
    RENT_AND_UTILITIES:  'utilities',
    LOAN_PAYMENTS:       'finance',
    BANK_FEES:           'finance',
    GENERAL_MERCHANDISE: 'shopping',
  };
  return m[cat ?? ''] ?? 'other';
}

function detectRecurring(txs: Omit<Transaction, 'id'>[]): Omit<Transaction, 'id'>[] {
  const byMerchant: Record<string, Omit<Transaction, 'id'>[]> = {};
  for (const tx of txs) {
    const key = tx.merchant_name.toLowerCase().trim();
    (byMerchant[key] ??= []).push(tx);
  }

  const result = [...txs];

  for (const [, group] of Object.entries(byMerchant)) {
    if (group.length < 2) continue;
    const amounts = group.map((t) => t.amount);
    const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    if (!amounts.every((a) => Math.abs(a - avg) < avg * 0.1)) continue;

    const dates = group.map((t) => new Date(t.date).getTime()).sort((a, b) => a - b);
    const gaps  = dates.slice(1).map((d, i) => Math.round((d - dates[i]) / 86400000));
    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
    const freq   = classifyGap(avgGap);
    if (!freq) continue;

    const key = group[0].merchant_name.toLowerCase().trim();
    for (const tx of result) {
      if (tx.merchant_name.toLowerCase().trim() === key) {
        tx.is_recurring        = true;
        tx.recurring_frequency = freq;
      }
    }
  }
  return result;
}

function classifyGap(d: number): RecurringFrequency | null {
  if (d >= 6  && d <= 8)    return 'weekly';
  if (d >= 13 && d <= 16)   return 'biweekly';
  if (d >= 27 && d <= 33)   return 'monthly';
  if (d >= 85 && d <= 95)   return 'quarterly';
  if (d >= 355 && d <= 375) return 'annual';
  return null;
}
