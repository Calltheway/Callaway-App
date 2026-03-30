// ─────────────────────────────────────────────
// KEEPER — Database helpers (server-side)
// Wraps Supabase calls with typed return values.
// ─────────────────────────────────────────────
import { createClient } from '@/lib/supabase/server';
import type {
  User, ConnectedAccount, Transaction,
  DetectedIssue, EmailConnection, SavingsEvent,
} from '@/types';

// ── Users ─────────────────────────────────────
export async function getProfile(userId: string): Promise<User | null> {
  const db = await createClient();
  const { data } = await db.from('users').select('*').eq('id', userId).single();
  return data as User | null;
}

export async function updateProfile(userId: string, updates: Partial<User>) {
  const db = await createClient();
  const { data, error } = await db.from('users').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data as User;
}

// ── Connected accounts ────────────────────────
export async function getAccounts(userId: string): Promise<ConnectedAccount[]> {
  const db = await createClient();
  const { data } = await db.from('connected_accounts').select('*').eq('user_id', userId).eq('is_active', true);
  return (data ?? []) as ConnectedAccount[];
}

export async function createAccount(account: Omit<ConnectedAccount, 'id'>): Promise<ConnectedAccount> {
  const db = await createClient();
  const { data, error } = await db.from('connected_accounts').insert(account).select().single();
  if (error) throw error;
  return data as ConnectedAccount;
}

// ── Transactions ──────────────────────────────
export async function upsertTransactions(txs: Omit<Transaction, 'id'>[]) {
  const db = await createClient();
  const { error } = await db.from('transactions').upsert(txs, { onConflict: 'plaid_transaction_id' });
  if (error) throw error;
}

export async function getRecentTransactions(userId: string, days = 90): Promise<Transaction[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
  const db = await createClient();
  const { data } = await db.from('transactions').select('*').eq('user_id', userId).gte('date', since).order('date', { ascending: false });
  return (data ?? []) as Transaction[];
}

// ── Issues ────────────────────────────────────
export async function getIssues(userId: string): Promise<DetectedIssue[]> {
  const db = await createClient();
  const { data } = await db.from('detected_issues').select('*').eq('user_id', userId).order('monthly_cost', { ascending: false });
  return (data ?? []) as DetectedIssue[];
}

export async function getIssueById(id: string): Promise<DetectedIssue | null> {
  const db = await createClient();
  const { data } = await db.from('detected_issues').select('*').eq('id', id).single();
  return data as DetectedIssue | null;
}

export async function upsertIssues(issues: Omit<DetectedIssue, 'id'>[]) {
  const db = await createClient();
  const { error } = await db.from('detected_issues').upsert(issues, { onConflict: 'user_id,issue_type,merchant_name' });
  if (error) throw error;
}

export async function updateIssueStatus(
  issueId: string,
  status:  DetectedIssue['status'],
  amountSaved?: number,
) {
  const db = await createClient();
  const updates: Partial<DetectedIssue> = { status };
  if (status === 'resolved') {
    updates.resolved_at  = new Date().toISOString();
    if (amountSaved !== undefined) updates.amount_saved = amountSaved;
  }
  const { error } = await db.from('detected_issues').update(updates).eq('id', issueId);
  if (error) throw error;
}

// ── Savings ───────────────────────────────────
export async function getSavingsHistory(userId: string): Promise<SavingsEvent[]> {
  const db = await createClient();
  const { data } = await db.from('savings_events').select('*').eq('user_id', userId).order('saved_at', { ascending: false });
  return (data ?? []) as SavingsEvent[];
}

export async function recordSavingsEvent(event: Omit<SavingsEvent, 'id'>): Promise<SavingsEvent> {
  const db = await createClient();
  const { data, error } = await db.from('savings_events').insert(event).select().single();
  if (error) throw error;
  return data as SavingsEvent;
}

export async function getTotalSaved(userId: string): Promise<number> {
  const db = await createClient();
  const { data } = await db.from('savings_events').select('amount_saved').eq('user_id', userId);
  return (data ?? []).reduce((sum, r) => sum + (r.amount_saved ?? 0), 0);
}

export async function getThisMonthSaved(userId: string): Promise<number> {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  const db = await createClient();
  const { data } = await db.from('savings_events').select('amount_saved').eq('user_id', userId).gte('saved_at', start.toISOString());
  return (data ?? []).reduce((sum, r) => sum + (r.amount_saved ?? 0), 0);
}

// ── Email connections ─────────────────────────
export async function getEmailConnections(userId: string): Promise<EmailConnection[]> {
  const db = await createClient();
  const { data } = await db.from('email_connections').select('*').eq('user_id', userId).eq('is_active', true);
  return (data ?? []) as EmailConnection[];
}
