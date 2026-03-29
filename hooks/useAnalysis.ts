// ─────────────────────────────────────────────
// KEEPER — Analysis Hook
// Triggers the AI analysis pipeline and stores results.
// ─────────────────────────────────────────────
import { useCallback } from 'react';
import { transactionsDb, issuesDb, savingsDb } from '@/lib/supabase';
import { analyzeTransactions, rankIssues } from '@/lib/claude';
import { useAppStore } from '@/store/useAppStore';
import type { DetectedIssue } from '@/types';

export function useAnalysis() {
  const {
    user,
    setIssues,
    setAnalyzing,
    setTotalSaved,
    setSavedThisMonth,
  } = useAppStore();

  /**
   * Run the full AI analysis pipeline.
   * Fetches transactions → sends to Claude → saves results.
   */
  const runAnalysis = useCallback(async (): Promise<{
    issuesFound: number;
    potentialSavings: number;
  }> => {
    if (!user) throw new Error('User not authenticated');

    setAnalyzing(true);

    try {
      // 1. Fetch recent transactions from Supabase
      const transactions = await transactionsDb.getRecent(user.id, 90);

      if (transactions.length === 0) {
        return { issuesFound: 0, potentialSavings: 0 };
      }

      // 2. Send to Claude for analysis
      const result = await analyzeTransactions(transactions, user.id);

      if (result.issues.length === 0) {
        return { issuesFound: 0, potentialSavings: 0 };
      }

      // 3. Rank issues by impact
      const ranked = rankIssues(result.issues, result.issues.length);

      // 4. Save to database
      const issuesToSave: Omit<DetectedIssue, 'id'>[] = ranked.map((issue) => ({
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

      await issuesDb.upsertMany(issuesToSave);

      // 5. Re-fetch from DB (gets assigned IDs)
      const savedIssues = await issuesDb.getAll(user.id);
      setIssues(savedIssues);

      // 6. Update savings totals
      const [totalSaved, thisMonthSaved] = await Promise.all([
        savingsDb.getTotalSaved(user.id),
        savingsDb.getThisMonthSaved(user.id),
      ]);
      setTotalSaved(totalSaved);
      setSavedThisMonth(thisMonthSaved);

      return {
        issuesFound:      savedIssues.length,
        potentialSavings: result.total_potential_savings,
      };
    } finally {
      setAnalyzing(false);
    }
  }, [user, setIssues, setAnalyzing, setTotalSaved, setSavedThisMonth]);

  /**
   * Mark an issue as resolved and record the savings.
   */
  const resolveIssue = useCallback(async (
    issueId:     string,
    amountSaved: number,
    method:      'cancellation' | 'negotiation' | 'dispute_won' | 'refund_claimed' | 'manual',
    description: string,
  ) => {
    if (!user) return;

    // 1. Update issue status
    await issuesDb.updateStatus(issueId, 'resolved', amountSaved);

    // 2. Record savings event
    const issue = await issuesDb.getById(issueId);
    const { savingsDb: db } = await import('@/lib/supabase');
    await db.record({
      user_id:       user.id,
      issue_id:      issueId,
      amount_saved:  amountSaved,
      saved_at:      new Date().toISOString(),
      method,
      merchant_name: issue.merchant_name,
      description,
    });

    // 3. Update local state
    useAppStore.getState().updateIssueStatus(issueId, 'resolved', amountSaved);

    // 4. Update totals
    const [totalSaved, thisMonthSaved] = await Promise.all([
      savingsDb.getTotalSaved(user.id),
      savingsDb.getThisMonthSaved(user.id),
    ]);
    setTotalSaved(totalSaved);
    setSavedThisMonth(thisMonthSaved);
  }, [user, setTotalSaved, setSavedThisMonth]);

  /**
   * Dismiss an issue (user doesn't want to act on it).
   */
  const dismissIssue = useCallback(async (issueId: string) => {
    await issuesDb.updateStatus(issueId, 'dismissed');
    useAppStore.getState().updateIssueStatus(issueId, 'dismissed');
  }, []);

  return { runAnalysis, resolveIssue, dismissIssue };
}
