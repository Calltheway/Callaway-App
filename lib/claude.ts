// ─────────────────────────────────────────────
// KEEPER — Claude AI Analysis Engine
// The brain of Keeper. Analyzes transactions and
// emails to find money leaks.
// ─────────────────────────────────────────────
import type { Transaction, AIAnalysisResult, AIDetectedIssue, IssueType } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

// ── Internal fetch wrapper ────────────────────
async function callClaude(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_ANTHROPIC_API_KEY in environment variables.');
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':         'application/json',
      'x-api-key':            apiKey,
      'anthropic-version':    '2023-06-01',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 4096,
      system:     systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// This is the core instruction set for Keeper's AI
// ─────────────────────────────────────────────
const KEEPER_SYSTEM_PROMPT = `You are Keeper, a personal financial guardian AI.

Your sole purpose is to protect people's money by finding every instance where they are losing money they don't need to lose.

You are methodical, thorough, and specific. You never guess — you only flag issues you have strong evidence for.

RULES:
1. Always return valid JSON — never add prose before or after the JSON block.
2. Dollar amounts must be numeric (e.g. 9.99, not "$9.99").
3. confidence_score must be between 0.0 and 1.0.
4. issue_type must be one of: forgotten_subscription, price_increase, duplicate_charge, unused_subscription, overpriced_service, unclaimed_refund, warranty_expiring, billing_error, free_trial_ending.
5. recommended_action must be one of: cancel, dispute, negotiate, claim, review, switch.
6. action_difficulty must be one of: easy, medium, hard.
7. plain_english_explanation must be written for a non-technical person. No jargon. Max 2 sentences.
8. Be conservative. Only return issues with confidence_score >= 0.70.
9. Sort issues by (monthly_cost * confidence_score) descending — biggest impact first.`;

// ─────────────────────────────────────────────
// Main Analysis Function
// ─────────────────────────────────────────────

/**
 * Analyzes a user's transaction history and returns detected issues.
 * This is the core Keeper intelligence pipeline.
 */
export async function analyzeTransactions(
  transactions: Transaction[],
  userId: string,
): Promise<AIAnalysisResult> {
  if (transactions.length === 0) {
    return {
      issues: [],
      analysis_date: new Date().toISOString(),
      transactions_analyzed: 0,
      total_potential_savings: 0,
    };
  }

  // Prepare transaction data for Claude (omit internal IDs for brevity)
  const txData = transactions.map((t) => ({
    merchant:   t.merchant_name,
    amount:     t.amount,
    date:       t.date,
    category:   t.category,
    recurring:  t.is_recurring,
    frequency:  t.recurring_frequency,
  }));

  const prompt = `Analyze these ${transactions.length} transactions from the past 90 days. Find every instance where this user is losing money they don't need to lose.

TRANSACTION DATA:
${JSON.stringify(txData, null, 2)}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

Return ONLY a JSON object in this exact format:
{
  "issues": [
    {
      "issue_type": "...",
      "merchant_name": "...",
      "monthly_cost": 0.00,
      "annual_cost": 0.00,
      "confidence_score": 0.00,
      "recommended_action": "...",
      "action_difficulty": "...",
      "plain_english_explanation": "...",
      "metadata": {}
    }
  ],
  "total_potential_savings": 0.00,
  "transactions_analyzed": ${transactions.length}
}`;

  try {
    const rawResponse = await callClaude(prompt, KEEPER_SYSTEM_PROMPT);

    // Extract JSON from response (handle cases where Claude adds extra text)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Claude returned no valid JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      issues:                  (parsed.issues ?? []) as AIDetectedIssue[],
      analysis_date:           new Date().toISOString(),
      transactions_analyzed:   parsed.transactions_analyzed ?? transactions.length,
      total_potential_savings: parsed.total_potential_savings ?? 0,
    };
  } catch (err) {
    console.error('[Keeper AI] Analysis failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────
// Subscription-Specific Deep Scan
// ─────────────────────────────────────────────

/**
 * Deep scan for subscriptions only — looks for price changes,
 * unused services, and forgotten charges.
 */
export async function scanSubscriptions(
  transactions: Transaction[],
): Promise<AIDetectedIssue[]> {
  const recurring = transactions.filter((t) => t.is_recurring);
  if (recurring.length === 0) return [];

  // Group by merchant to find price trends
  const byMerchant = recurring.reduce<Record<string, Transaction[]>>((acc, t) => {
    if (!acc[t.merchant_name]) acc[t.merchant_name] = [];
    acc[t.merchant_name].push(t);
    return acc;
  }, {});

  const subscriptionSummary = Object.entries(byMerchant).map(([merchant, txs]) => {
    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date));
    return {
      merchant,
      charge_count:    txs.length,
      oldest_charge:   sorted[0]?.date,
      latest_charge:   sorted[sorted.length - 1]?.date,
      amounts:         txs.map((t) => t.amount),
      average_amount:  txs.reduce((s, t) => s + t.amount, 0) / txs.length,
      latest_amount:   sorted[sorted.length - 1]?.amount,
      price_increased: sorted.some((t, i) =>
        i > 0 && t.amount > sorted[i - 1].amount * 1.03,
      ),
    };
  });

  const prompt = `Analyze these recurring subscriptions for issues:

${JSON.stringify(subscriptionSummary, null, 2)}

TODAY: ${new Date().toISOString().split('T')[0]}

Look specifically for:
1. Price increases (any charge > 3% more than previous charges for same merchant)
2. Subscriptions that appear to be duplicates (same service, similar names)
3. Annual vs monthly pricing — is the user paying monthly for something with a cheaper annual option?

Return ONLY a JSON array:
[
  {
    "issue_type": "...",
    "merchant_name": "...",
    "monthly_cost": 0.00,
    "annual_cost": 0.00,
    "confidence_score": 0.00,
    "recommended_action": "...",
    "action_difficulty": "...",
    "plain_english_explanation": "...",
    "metadata": {
      "price_before": 0.00,
      "price_after": 0.00
    }
  }
]`;

  try {
    const raw = await callClaude(prompt, KEEPER_SYSTEM_PROMPT);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AIDetectedIssue[];
  } catch (err) {
    console.error('[Keeper AI] Subscription scan failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
// Billing Anomaly Detector
// ─────────────────────────────────────────────

/**
 * Finds duplicate charges, unexpected one-time fees from subscription
 * merchants, and billing errors.
 */
export async function detectBillingAnomalies(
  transactions: Transaction[],
): Promise<AIDetectedIssue[]> {
  if (transactions.length < 2) return [];

  // Find potential duplicates: same merchant, similar amount, within 7 days
  const potentialDuplicates: Array<{
    merchant: string;
    amount: number;
    date1: string;
    date2: string;
    days_apart: number;
  }> = [];

  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const daysDiff = Math.abs(
        (new Date(b.date).getTime() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (
        daysDiff <= 7 &&
        a.merchant_name.toLowerCase() === b.merchant_name.toLowerCase() &&
        Math.abs(a.amount - b.amount) < 0.01
      ) {
        potentialDuplicates.push({
          merchant:   a.merchant_name,
          amount:     a.amount,
          date1:      a.date,
          date2:      b.date,
          days_apart: Math.round(daysDiff),
        });
      }
    }
  }

  if (potentialDuplicates.length === 0) return [];

  const prompt = `Review these potential duplicate charges. For each one, determine if it's a genuine duplicate or a legitimate pair of charges (e.g. monthly subscription charged on different dates).

${JSON.stringify(potentialDuplicates, null, 2)}

Return ONLY a JSON array of confirmed issues (skip any you're not confident about):
[
  {
    "issue_type": "duplicate_charge",
    "merchant_name": "...",
    "monthly_cost": 0.00,
    "annual_cost": 0.00,
    "confidence_score": 0.00,
    "recommended_action": "dispute",
    "action_difficulty": "medium",
    "plain_english_explanation": "...",
    "metadata": {}
  }
]`;

  try {
    const raw = await callClaude(prompt, KEEPER_SYSTEM_PROMPT);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]) as AIDetectedIssue[];
  } catch (err) {
    console.error('[Keeper AI] Anomaly detection failed:', err);
    return [];
  }
}

// ─────────────────────────────────────────────
// Savings Opportunity Ranker
// ─────────────────────────────────────────────

/**
 * Takes all detected issues and ranks them by:
 * (dollar impact × ease of fix × confidence)
 * Returns top N issues to show on home screen.
 */
export function rankIssues(issues: AIDetectedIssue[], topN = 3): AIDetectedIssue[] {
  const difficultyMultiplier: Record<string, number> = {
    easy:   1.0,
    medium: 0.7,
    hard:   0.4,
  };

  return [...issues]
    .sort((a, b) => {
      const scoreA = a.monthly_cost * a.confidence_score * (difficultyMultiplier[a.action_difficulty] ?? 0.7);
      const scoreB = b.monthly_cost * b.confidence_score * (difficultyMultiplier[b.action_difficulty] ?? 0.7);
      return scoreB - scoreA;
    })
    .slice(0, topN);
}

// ─────────────────────────────────────────────
// Negotiation Script Generator
// ─────────────────────────────────────────────

/**
 * Generates a phone negotiation script for a specific bill or service.
 */
export async function generateNegotiationScript(
  merchantName: string,
  currentMonthlyAmount: number,
  issueContext: string,
): Promise<string> {
  const prompt = `Generate a concise, confident phone negotiation script for a customer trying to lower their ${merchantName} bill.

Current monthly cost: $${currentMonthlyAmount.toFixed(2)}
Context: ${issueContext}

The script should:
1. Be 200 words or less
2. Sound natural and human (not robotic)
3. Include a specific "ask" (either a discount or cancellation threat)
4. Include responses to 2 common pushbacks from customer service reps
5. End with what to do if they say no (escalate to supervisor, threaten to cancel)

Format as plain text paragraphs. Start with "Hi, I'm calling about my account..."`;

  return callClaude(prompt, KEEPER_SYSTEM_PROMPT);
}
