// ─────────────────────────────────────────────
// KEEPER — Global TypeScript Types
// ─────────────────────────────────────────────

// ── User & Auth ──────────────────────────────
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
  total_saved: number;
  full_name?: string;
  avatar_url?: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'keeper_plus';

// ── Connected Accounts ────────────────────────
export interface ConnectedAccount {
  id: string;
  user_id: string;
  plaid_item_id: string;
  institution_name: string;
  institution_logo?: string;
  institution_color?: string;
  last_synced: string;
  account_type: PlaidAccountType;
  account_name: string;
  mask?: string; // last 4 digits
  is_active: boolean;
}

export type PlaidAccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'other';

// ── Transactions ──────────────────────────────
export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  merchant_name: string;
  merchant_logo?: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  plaid_transaction_id?: string;
  pending: boolean;
}

export type TransactionCategory =
  | 'streaming'
  | 'software'
  | 'fitness'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'finance'
  | 'shopping'
  | 'other';

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';

// ── Detected Issues ───────────────────────────
export interface DetectedIssue {
  id: string;
  user_id: string;
  issue_type: IssueType;
  merchant_name: string;
  merchant_logo?: string;
  monthly_cost: number;
  annual_cost: number;
  status: IssueStatus;
  confidence_score: number; // 0–1
  detected_at: string;
  resolved_at?: string;
  amount_saved?: number;
  // AI-generated content
  plain_english_explanation: string;
  recommended_action: RecommendedAction;
  action_difficulty: ActionDifficulty;
  // Extra metadata per issue type
  metadata?: IssueMetadata;
}

export type IssueType =
  | 'forgotten_subscription'
  | 'price_increase'
  | 'duplicate_charge'
  | 'unused_subscription'
  | 'overpriced_service'
  | 'unclaimed_refund'
  | 'warranty_expiring'
  | 'billing_error'
  | 'free_trial_ending';

export type IssueStatus = 'new' | 'in_progress' | 'resolved' | 'dismissed';

export type RecommendedAction = 'cancel' | 'dispute' | 'negotiate' | 'claim' | 'review' | 'switch';

export type ActionDifficulty = 'easy' | 'medium' | 'hard';

export interface IssueMetadata {
  price_before?: number;
  price_after?: number;
  last_used_date?: string;
  duplicate_transaction_id?: string;
  warranty_expiry_date?: string;
  refund_deadline?: string;
  negotiation_script?: string;
  cancellation_url?: string;
  cancellation_phone?: string;
}

// ── Email Connections ─────────────────────────
export interface EmailConnection {
  id: string;
  user_id: string;
  provider: EmailProvider;
  email_address: string;
  last_synced: string;
  receipts_found: number;
  is_active: boolean;
}

export type EmailProvider = 'gmail' | 'outlook';

// ── Savings Events ────────────────────────────
export interface SavingsEvent {
  id: string;
  user_id: string;
  issue_id: string;
  amount_saved: number;
  saved_at: string;
  method: SavingsMethod;
  merchant_name: string;
  description: string;
}

export type SavingsMethod =
  | 'cancellation'
  | 'negotiation'
  | 'dispute_won'
  | 'refund_claimed'
  | 'manual';

// ── AI Analysis ───────────────────────────────
export interface AIAnalysisResult {
  issues: AIDetectedIssue[];
  analysis_date: string;
  transactions_analyzed: number;
  total_potential_savings: number;
}

export interface AIDetectedIssue {
  issue_type: IssueType;
  merchant_name: string;
  monthly_cost: number;
  annual_cost: number;
  confidence_score: number;
  recommended_action: RecommendedAction;
  action_difficulty: ActionDifficulty;
  plain_english_explanation: string;
  metadata?: IssueMetadata;
}

// ── Plaid ─────────────────────────────────────
export interface PlaidLinkResult {
  public_token: string;
  institution: {
    name: string;
    institution_id: string;
  };
  accounts: PlaidAccount[];
}

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: PlaidAccountType;
  subtype: string;
}

// ── Navigation ────────────────────────────────
export type RootStackParamList = {
  '(auth)/welcome': undefined;
  '(auth)/sign-in': undefined;
  '(onboarding)/index': undefined;
  '(onboarding)/connect-bank': undefined;
  '(onboarding)/connect-email': undefined;
  '(onboarding)/first-scan': undefined;
  '(onboarding)/permissions': undefined;
  '(tabs)/index': undefined;
  '(tabs)/issues': undefined;
  '(tabs)/history': undefined;
  '(tabs)/settings': undefined;
  'issue/[id]': { id: string };
  paywall: { feature?: string };
};

// ── UI State ──────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// ── RevenueCat ────────────────────────────────
export interface SubscriptionProduct {
  identifier: string;
  title: string;
  description: string;
  price: string;
  pricePerMonth?: string;
  period: 'monthly' | 'annual';
}

export interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: string;
  expirationDate?: string;
}
