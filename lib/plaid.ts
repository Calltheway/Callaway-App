// ─────────────────────────────────────────────
// KEEPER — Plaid Integration
// Handles bank connections and transaction syncing.
// We NEVER see or store bank credentials — Plaid handles
// all of that. We only receive read-only access tokens.
// ─────────────────────────────────────────────
import { supabase } from './supabase';
import type {
  PlaidLinkResult,
  Transaction,
  TransactionCategory,
  RecurringFrequency,
} from '@/types';

const PLAID_BASE_URL = process.env.EXPO_PUBLIC_PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : process.env.EXPO_PUBLIC_PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com';

// ── Plaid API helper ──────────────────────────
async function plaidRequest<T>(endpoint: string, body: object): Promise<T> {
  const clientId = process.env.EXPO_PUBLIC_PLAID_CLIENT_ID;
  const secret   = process.env.EXPO_PUBLIC_PLAID_SECRET;

  if (!clientId || !secret) {
    throw new Error('Missing Plaid credentials in environment variables.');
  }

  const response = await fetch(`${PLAID_BASE_URL}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ client_id: clientId, secret, ...body }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Plaid error: ${err.error_message ?? JSON.stringify(err)}`);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Plaid Link Token
// Creates a "link token" — a one-time token that launches
// the Plaid bank connection UI in the app.
// ─────────────────────────────────────────────
export async function createLinkToken(userId: string): Promise<string> {
  const data = await plaidRequest<{ link_token: string }>('/link/token/create', {
    user:          { client_user_id: userId },
    client_name:   'Keeper',
    products:      ['transactions'],
    country_codes: ['US'],
    language:      'en',
    webhook:       process.env.EXPO_PUBLIC_PLAID_WEBHOOK_URL,
  });

  return data.link_token;
}

// ─────────────────────────────────────────────
// Exchange Public Token for Access Token
// After user connects their bank, Plaid gives us a
// temporary public_token. We exchange it for a permanent
// access_token (stored encrypted in Supabase).
// ─────────────────────────────────────────────
export async function exchangePublicToken(publicToken: string): Promise<{
  access_token: string;
  item_id: string;
}> {
  return plaidRequest('/item/public_token/exchange', {
    public_token: publicToken,
  });
}

// ─────────────────────────────────────────────
// Get Institution Details
// ─────────────────────────────────────────────
export async function getInstitution(institutionId: string): Promise<{
  name:  string;
  logo:  string | null;
  color: string | null;
}> {
  const data = await plaidRequest<{
    institution: { name: string; logo: string | null; primary_color: string | null };
  }>('/institutions/get_by_id', {
    institution_id: institutionId,
    country_codes:  ['US'],
    options:        { include_optional_metadata: true },
  });

  return {
    name:  data.institution.name,
    logo:  data.institution.logo,
    color: data.institution.primary_color,
  };
}

// ─────────────────────────────────────────────
// Sync Transactions
// Fetches the last 90 days of transactions and stores
// them in our Supabase database.
// ─────────────────────────────────────────────
export async function syncTransactions(
  accessToken: string,
  accountId:   string,
  userId:      string,
): Promise<{ count: number; transactions: Transaction[] }> {
  // Calculate date range: 90 days back
  const endDate   = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const data = await plaidRequest<{
    transactions: PlaidTransaction[];
    total_transactions: number;
  }>('/transactions/get', {
    access_token: accessToken,
    start_date:   startDate,
    end_date:     endDate,
    options:      { count: 500, include_personal_finance_category: true },
  });

  // Convert Plaid transactions to our internal format
  const transactions: Omit<Transaction, 'id'>[] = data.transactions.map((tx) =>
    normalizePlaidTransaction(tx, userId, accountId),
  );

  // Detect recurring charges by grouping same-merchant charges
  const withRecurring = detectRecurringPatterns(transactions);

  // Store in Supabase
  const { error } = await supabase
    .from('transactions')
    .upsert(withRecurring, { onConflict: 'plaid_transaction_id' });

  if (error) throw error;

  return {
    count:        withRecurring.length,
    transactions: withRecurring as Transaction[],
  };
}

// ─────────────────────────────────────────────
// Internal: Normalize Plaid → Keeper format
// ─────────────────────────────────────────────
interface PlaidTransaction {
  transaction_id:                  string;
  merchant_name?:                  string;
  name:                            string;
  amount:                          number;
  date:                            string;
  pending:                         boolean;
  logo_url?:                       string;
  personal_finance_category?:      { primary: string; detailed: string };
}

function normalizePlaidTransaction(
  tx:        PlaidTransaction,
  userId:    string,
  accountId: string,
): Omit<Transaction, 'id'> {
  return {
    user_id:              userId,
    account_id:           accountId,
    plaid_transaction_id: tx.transaction_id,
    merchant_name:        tx.merchant_name ?? tx.name,
    merchant_logo:        tx.logo_url,
    amount:               Math.abs(tx.amount), // Plaid uses negative for income
    date:                 tx.date,
    category:             mapPlaidCategory(tx.personal_finance_category?.primary),
    is_recurring:         false, // determined later
    pending:              tx.pending,
  };
}

function mapPlaidCategory(plaidCategory?: string): TransactionCategory {
  const map: Record<string, TransactionCategory> = {
    'ENTERTAINMENT':         'streaming',
    'GENERAL_SERVICES':      'software',
    'RECREATION':            'fitness',
    'FOOD_AND_DRINK':        'food',
    'GENERAL_MERCHANDISE':   'shopping',
    'HOME_IMPROVEMENT':      'other',
    'MEDICAL':               'other',
    'PERSONAL_CARE':         'other',
    'TRANSPORTATION':        'other',
    'TRAVEL':                'other',
    'RENT_AND_UTILITIES':    'utilities',
    'LOAN_PAYMENTS':         'finance',
    'BANK_FEES':             'finance',
    'INCOME':                'other',
    'TRANSFER_IN':           'other',
    'TRANSFER_OUT':          'finance',
  };
  return map[plaidCategory ?? ''] ?? 'other';
}

// ─────────────────────────────────────────────
// Internal: Detect Recurring Patterns
// Groups transactions by merchant. If the same merchant
// appears at consistent intervals (7/14/30/90/365 days),
// marks them as recurring.
// ─────────────────────────────────────────────
function detectRecurringPatterns(
  transactions: Omit<Transaction, 'id'>[],
): Omit<Transaction, 'id'>[] {
  const byMerchant: Record<string, Omit<Transaction, 'id'>[]> = {};

  for (const tx of transactions) {
    const key = tx.merchant_name.toLowerCase().trim();
    if (!byMerchant[key]) byMerchant[key] = [];
    byMerchant[key].push(tx);
  }

  const result = [...transactions];

  for (const [, txs] of Object.entries(byMerchant)) {
    if (txs.length < 2) continue;

    // Need consistent amounts to be a subscription
    const amounts = txs.map((t) => t.amount);
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
    const allSimilarAmount = amounts.every((a) => Math.abs(a - avgAmount) < avgAmount * 0.1);

    if (!allSimilarAmount) continue;

    // Check interval consistency
    const sortedDates = txs
      .map((t) => new Date(t.date).getTime())
      .sort((a, b) => a - b);

    const intervals = sortedDates
      .slice(1)
      .map((d, i) => Math.round((d - sortedDates[i]) / (1000 * 60 * 60 * 24)));

    const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
    const frequency = classifyInterval(avgInterval);

    if (frequency) {
      const merchantName = txs[0].merchant_name.toLowerCase().trim();
      for (const tx of result) {
        if (tx.merchant_name.toLowerCase().trim() === merchantName) {
          (tx as Transaction).is_recurring        = true;
          (tx as Transaction).recurring_frequency = frequency;
        }
      }
    }
  }

  return result;
}

function classifyInterval(avgDays: number): RecurringFrequency | null {
  if (avgDays >= 6  && avgDays <= 8)   return 'weekly';
  if (avgDays >= 13 && avgDays <= 16)  return 'biweekly';
  if (avgDays >= 27 && avgDays <= 33)  return 'monthly';
  if (avgDays >= 85 && avgDays <= 95)  return 'quarterly';
  if (avgDays >= 355 && avgDays <= 375) return 'annual';
  return null;
}
