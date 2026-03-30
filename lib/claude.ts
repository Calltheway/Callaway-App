// ─────────────────────────────────────────────
// KEEPER — Claude AI Analysis Engine (Server-side only)
// This file runs on the server (API routes) — the API
// key is never sent to the browser.
// ─────────────────────────────────────────────
import Anthropic from '@anthropic-ai/sdk';
import type { Transaction, AIAnalysisResult, AIDetectedIssue } from '@/types';

const MODEL = 'claude-sonnet-4-6';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM_PROMPT = `You are Keeper, a personal financial guardian AI.

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
// Main analysis: full transaction pipeline
// ─────────────────────────────────────────────
export async function analyzeTransactions(
  transactions: Transaction[],
): Promise<AIAnalysisResult> {
  if (transactions.length === 0) {
    return { issues: [], analysis_date: new Date().toISOString(), transactions_analyzed: 0, total_potential_savings: 0 };
  }

  const client = getClient();

  const txData = transactions.map((t) => ({
    merchant:  t.merchant_name,
    amount:    t.amount,
    date:      t.date,
    category:  t.category,
    recurring: t.is_recurring,
    frequency: t.recurring_frequency,
  }));

  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 4096,
    system:     SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: `Analyze these ${transactions.length} transactions from the past 90 days. Find every instance where this user is losing money.

TRANSACTION DATA:
${JSON.stringify(txData, null, 2)}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

Return ONLY this JSON:
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
}`,
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned no valid JSON');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    issues:                  (parsed.issues ?? []) as AIDetectedIssue[],
    analysis_date:           new Date().toISOString(),
    transactions_analyzed:   parsed.transactions_analyzed ?? transactions.length,
    total_potential_savings: parsed.total_potential_savings ?? 0,
  };
}

// ─────────────────────────────────────────────
// Negotiation script generator
// ─────────────────────────────────────────────
export async function generateNegotiationScript(
  merchantName:         string,
  currentMonthlyAmount: number,
  issueContext:         string,
): Promise<string> {
  const client = getClient();

  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 600,
    system:     SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: `Write a concise phone negotiation script for a customer lowering their ${merchantName} bill.
Current monthly cost: $${currentMonthlyAmount.toFixed(2)}
Context: ${issueContext}

Script requirements:
- Under 200 words
- Natural and human
- Include a specific ask (discount % or cancellation threat)
- Include 2 pushback responses
- End with escalation advice

Start with: "Hi, I'm calling about my account..."`,
    }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// ─────────────────────────────────────────────
// Issue ranker
// ─────────────────────────────────────────────
export function rankIssues(issues: AIDetectedIssue[], topN = 3): AIDetectedIssue[] {
  const diff: Record<string, number> = { easy: 1.0, medium: 0.7, hard: 0.4 };
  return [...issues]
    .sort((a, b) => {
      const sA = a.monthly_cost * a.confidence_score * (diff[a.action_difficulty] ?? 0.7);
      const sB = b.monthly_cost * b.confidence_score * (diff[b.action_difficulty] ?? 0.7);
      return sB - sA;
    })
    .slice(0, topN);
}
