// ─────────────────────────────────────────────
// KEEPER — Supabase Client
// ─────────────────────────────────────────────
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import type {
  User,
  ConnectedAccount,
  Transaction,
  DetectedIssue,
  EmailConnection,
  SavingsEvent,
} from '@/types';

// ── SecureStore adapter for Supabase auth tokens ─────────────────────────────
// Supabase needs to store auth tokens. We use SecureStore (encrypted device
// storage) instead of AsyncStorage so tokens are protected by Face ID / PIN.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Keeper] Missing Supabase env vars. Copy .env.example to .env and fill in your values.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─────────────────────────────────────────────
// Auth helpers
// ─────────────────────────────────────────────

export const authHelpers = {
  /** Sign up with email + password */
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign in with email + password */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign in with magic link (passwordless) */
  signInWithMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'keeper://auth/callback' },
    });
    if (error) throw error;
  },

  /** Sign out */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get the currently logged in user */
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /** Get the current session */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

// ─────────────────────────────────────────────
// Database helpers — Users
// ─────────────────────────────────────────────

export const userDb = {
  /** Get full user profile from our users table */
  getProfile: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data as User;
  },

  /** Update user profile */
  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as User;
  },

  /** Add to the user's total saved amount */
  addToTotalSaved: async (userId: string, amount: number) => {
    const { error } = await supabase.rpc('increment_total_saved', {
      user_id: userId,
      amount,
    });
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────
// Database helpers — Connected Accounts (Plaid)
// ─────────────────────────────────────────────

export const accountsDb = {
  /** Get all bank accounts connected by this user */
  getAll: async (userId: string): Promise<ConnectedAccount[]> => {
    const { data, error } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ConnectedAccount[];
  },

  /** Save a new connected account after Plaid Link */
  create: async (account: Omit<ConnectedAccount, 'id'>): Promise<ConnectedAccount> => {
    const { data, error } = await supabase
      .from('connected_accounts')
      .insert(account)
      .select()
      .single();
    if (error) throw error;
    return data as ConnectedAccount;
  },

  /** Mark account as synced now */
  markSynced: async (accountId: string) => {
    const { error } = await supabase
      .from('connected_accounts')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', accountId);
    if (error) throw error;
  },

  /** Soft-delete (deactivate) a connected account */
  disconnect: async (accountId: string) => {
    const { error } = await supabase
      .from('connected_accounts')
      .update({ is_active: false })
      .eq('id', accountId);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────
// Database helpers — Transactions
// ─────────────────────────────────────────────

export const transactionsDb = {
  /** Upsert transactions (insert, ignore duplicates by plaid_transaction_id) */
  upsertMany: async (transactions: Omit<Transaction, 'id'>[]) => {
    const { error } = await supabase
      .from('transactions')
      .upsert(transactions, { onConflict: 'plaid_transaction_id' });
    if (error) throw error;
  },

  /** Get recent transactions for a user (last N days) */
  getRecent: async (userId: string, days = 90): Promise<Transaction[]> => {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Transaction[];
  },

  /** Get only recurring transactions */
  getRecurring: async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .order('amount', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Transaction[];
  },
};

// ─────────────────────────────────────────────
// Database helpers — Detected Issues
// ─────────────────────────────────────────────

export const issuesDb = {
  /** Get all active issues for a user */
  getAll: async (userId: string): Promise<DetectedIssue[]> => {
    const { data, error } = await supabase
      .from('detected_issues')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'dismissed')
      .order('monthly_cost', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DetectedIssue[];
  },

  /** Get a single issue by ID */
  getById: async (issueId: string): Promise<DetectedIssue> => {
    const { data, error } = await supabase
      .from('detected_issues')
      .select('*')
      .eq('id', issueId)
      .single();
    if (error) throw error;
    return data as DetectedIssue;
  },

  /** Insert new detected issues from AI analysis */
  upsertMany: async (issues: Omit<DetectedIssue, 'id'>[]) => {
    const { error } = await supabase
      .from('detected_issues')
      .upsert(issues, { onConflict: 'user_id,issue_type,merchant_name' });
    if (error) throw error;
  },

  /** Update the status of an issue */
  updateStatus: async (
    issueId: string,
    status: DetectedIssue['status'],
    amountSaved?: number,
  ) => {
    const updates: Partial<DetectedIssue> = { status };
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      if (amountSaved !== undefined) updates.amount_saved = amountSaved;
    }
    const { error } = await supabase
      .from('detected_issues')
      .update(updates)
      .eq('id', issueId);
    if (error) throw error;
  },

  /** Count new issues */
  countNew: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('detected_issues')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'new');
    if (error) throw error;
    return count ?? 0;
  },
};

// ─────────────────────────────────────────────
// Database helpers — Email Connections
// ─────────────────────────────────────────────

export const emailDb = {
  getAll: async (userId: string): Promise<EmailConnection[]> => {
    const { data, error } = await supabase
      .from('email_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    if (error) throw error;
    return (data ?? []) as EmailConnection[];
  },

  create: async (conn: Omit<EmailConnection, 'id'>): Promise<EmailConnection> => {
    const { data, error } = await supabase
      .from('email_connections')
      .insert(conn)
      .select()
      .single();
    if (error) throw error;
    return data as EmailConnection;
  },

  disconnect: async (connectionId: string) => {
    const { error } = await supabase
      .from('email_connections')
      .update({ is_active: false })
      .eq('id', connectionId);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────
// Database helpers — Savings Events
// ─────────────────────────────────────────────

export const savingsDb = {
  /** Get savings history for a user */
  getHistory: async (userId: string): Promise<SavingsEvent[]> => {
    const { data, error } = await supabase
      .from('savings_events')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as SavingsEvent[];
  },

  /** Record a new savings event */
  record: async (event: Omit<SavingsEvent, 'id'>): Promise<SavingsEvent> => {
    const { data, error } = await supabase
      .from('savings_events')
      .insert(event)
      .select()
      .single();
    if (error) throw error;
    return data as SavingsEvent;
  },

  /** Get total saved amount for user */
  getTotalSaved: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('savings_events')
      .select('amount_saved')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.amount_saved ?? 0), 0);
  },

  /** Get savings for current month */
  getThisMonthSaved: async (userId: string): Promise<number> => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('savings_events')
      .select('amount_saved')
      .eq('user_id', userId)
      .gte('saved_at', startOfMonth.toISOString());
    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.amount_saved ?? 0), 0);
  },
};
