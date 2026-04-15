// ─────────────────────────────────────────────────────────────────
// ORACLE — Demo Data (used when Supabase is not configured)
// ─────────────────────────────────────────────────────────────────

import type { DetectedIssue, SavingsEvent, ConnectedAccount, EmailConnection } from '@/types';

export const DEMO_ISSUES: DetectedIssue[] = [
  {
    id: 'demo-1',
    user_id: 'demo',
    issue_type: 'forgotten_subscription',
    merchant_name: 'Adobe Creative Cloud',
    monthly_cost: 54.99,
    annual_cost: 659.88,
    status: 'new',
    confidence_score: 0.94,
    detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    plain_english_explanation:
      "You've been paying $54.99/month for Adobe Creative Cloud but our analysis shows zero usage in the past 5 months. Last file opened: Nov 2024. Cancelling would save you $659.88 per year.",
    recommended_action: 'cancel',
    action_difficulty: 'easy',
    metadata: { cancellation_url: 'https://account.adobe.com' },
  },
  {
    id: 'demo-2',
    user_id: 'demo',
    issue_type: 'price_increase',
    merchant_name: 'Netflix',
    monthly_cost: 22.99,
    annual_cost: 275.88,
    status: 'new',
    confidence_score: 0.99,
    detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    plain_english_explanation:
      'Netflix quietly raised your plan from $15.49 to $22.99 in January — a 48% increase. You were not notified by email. Consider downgrading to the Standard plan or negotiating a loyalty discount.',
    recommended_action: 'negotiate',
    action_difficulty: 'medium',
    metadata: { price_before: 15.49, price_after: 22.99 },
  },
  {
    id: 'demo-3',
    user_id: 'demo',
    issue_type: 'duplicate_charge',
    merchant_name: 'Spotify',
    monthly_cost: 10.99,
    annual_cost: 131.88,
    status: 'new',
    confidence_score: 0.87,
    detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    plain_english_explanation:
      "You're being charged for Spotify Premium twice — once on a personal card ($10.99) and once through an old family plan that wasn't cancelled ($10.99). Disputing the duplicate would recover $131.88/year.",
    recommended_action: 'dispute',
    action_difficulty: 'easy',
  },
  {
    id: 'demo-4',
    user_id: 'demo',
    issue_type: 'overpriced_service',
    merchant_name: 'Verizon Wireless',
    monthly_cost: 45.00,
    annual_cost: 540.00,
    status: 'in_progress',
    confidence_score: 0.82,
    detected_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    plain_english_explanation:
      "Your current Verizon plan is $45/month more than comparable plans from T-Mobile or Mint Mobile. Based on your usage (avg 4GB/month, 400 minutes), you're paying for capacity you never use.",
    recommended_action: 'switch',
    action_difficulty: 'medium',
  },
  {
    id: 'demo-5',
    user_id: 'demo',
    issue_type: 'unclaimed_refund',
    merchant_name: 'Amazon',
    monthly_cost: 67.32,
    annual_cost: 67.32,
    status: 'new',
    confidence_score: 0.96,
    detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    plain_english_explanation:
      'A $67.32 order from March 12 shows as "returned" in Amazon\'s system, but the refund was never credited to your card. You have until May 12 to claim it.',
    recommended_action: 'claim',
    action_difficulty: 'easy',
    metadata: { refund_deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString() },
  },
  {
    id: 'demo-6',
    user_id: 'demo',
    issue_type: 'unused_subscription',
    merchant_name: 'Peloton App',
    monthly_cost: 12.99,
    annual_cost: 155.88,
    status: 'resolved',
    confidence_score: 0.91,
    detected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    amount_saved: 12.99,
    plain_english_explanation:
      'You subscribed to Peloton App after buying a bike but last logged in 8 months ago. Monthly charge of $12.99 with zero usage.',
    recommended_action: 'cancel',
    action_difficulty: 'easy',
  },
];

export const DEMO_SAVINGS_HISTORY: SavingsEvent[] = [
  {
    id: 'sh-1',
    user_id: 'demo',
    issue_id: 'demo-6',
    amount_saved: 155.88,
    saved_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    method: 'cancellation',
    merchant_name: 'Peloton App',
    description: 'Cancelled unused subscription — saving $12.99/month',
  },
  {
    id: 'sh-2',
    user_id: 'demo',
    issue_id: 'demo-old-1',
    amount_saved: 240.00,
    saved_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    method: 'negotiation',
    merchant_name: 'Comcast Xfinity',
    description: 'Negotiated bill from $120/mo to $100/mo — loyalty retention deal',
  },
  {
    id: 'sh-3',
    user_id: 'demo',
    issue_id: 'demo-old-2',
    amount_saved: 89.97,
    saved_at: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString(),
    method: 'dispute_won',
    merchant_name: 'DoorDash',
    description: 'Won chargeback for triple-billed delivery fee',
  },
  {
    id: 'sh-4',
    user_id: 'demo',
    issue_id: 'demo-old-3',
    amount_saved: 47.94,
    saved_at: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    method: 'refund_claimed',
    merchant_name: 'Audible',
    description: 'Claimed unused credit refund before expiry',
  },
];

export const DEMO_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acct-1',
    user_id: 'demo',
    plaid_item_id: 'demo-plaid-1',
    institution_name: 'Chase Bank',
    last_synced: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    account_type: 'checking',
    account_name: 'Total Checking',
    mask: '4242',
    is_active: true,
  },
  {
    id: 'acct-2',
    user_id: 'demo',
    plaid_item_id: 'demo-plaid-2',
    institution_name: 'Chase Bank',
    last_synced: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    account_type: 'credit',
    account_name: 'Sapphire Reserve',
    mask: '8881',
    is_active: true,
  },
];

export const DEMO_EMAIL_CONNECTIONS: EmailConnection[] = [];

export const DEMO_TOTAL_SAVED = DEMO_SAVINGS_HISTORY.reduce((sum, e) => sum + e.amount_saved, 0);
export const DEMO_THIS_MONTH_SAVED = DEMO_SAVINGS_HISTORY
  .filter((e) => new Date(e.saved_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .reduce((sum, e) => sum + e.amount_saved, 0);
