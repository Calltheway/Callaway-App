// POST /api/analyze
// Fetches transactions from DB, sends to Claude, saves results.
// Runs server-side — API key is never exposed to browser.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRecentTransactions, upsertIssues, getIssues } from '@/lib/db';
import { analyzeTransactions, rankIssues } from '@/lib/claude';
import type { DetectedIssue } from '@/types';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const transactions = await getRecentTransactions(user.id, 90);

    if (transactions.length === 0) {
      return NextResponse.json({ issuesFound: 0, potentialSavings: 0, issues: [] });
    }

    const result = await analyzeTransactions(transactions);

    if (result.issues.length > 0) {
      const ranked = rankIssues(result.issues, result.issues.length);

      const toSave: Omit<DetectedIssue, 'id'>[] = ranked.map((issue) => ({
        user_id:                   user.id,
        issue_type:                issue.issue_type,
        merchant_name:             issue.merchant_name,
        monthly_cost:              issue.monthly_cost,
        annual_cost:               issue.annual_cost,
        status:                    'new' as const,
        confidence_score:          issue.confidence_score,
        plain_english_explanation: issue.plain_english_explanation,
        recommended_action:        issue.recommended_action,
        action_difficulty:         issue.action_difficulty,
        metadata:                  issue.metadata,
        detected_at:               new Date().toISOString(),
      }));

      await upsertIssues(toSave);
    }

    const savedIssues = await getIssues(user.id);

    return NextResponse.json({
      issuesFound:      savedIssues.length,
      potentialSavings: result.total_potential_savings,
      issues:           savedIssues,
    });
  } catch (err) {
    console.error('[/api/analyze]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 },
    );
  }
}
