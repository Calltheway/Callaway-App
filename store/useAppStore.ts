// ─────────────────────────────────────────────
// KEEPER — Global App State (Zustand)
// Zustand is a simple state manager — think of it as
// a single shared memory that all screens can read/update.
// ─────────────────────────────────────────────
import { create } from 'zustand';
import type {
  User,
  ConnectedAccount,
  DetectedIssue,
  SavingsEvent,
  EmailConnection,
  SubscriptionTier,
} from '@/types';

// ─────────────────────────────────────────────
// State Shape
// ─────────────────────────────────────────────
interface AppState {
  // ── Auth ──────────────────────────────────
  user:                   User | null;
  isAuthenticated:        boolean;
  isBiometricVerified:    boolean;
  isOnboardingComplete:   boolean;

  // ── Bank & Email ──────────────────────────
  connectedAccounts:  ConnectedAccount[];
  emailConnections:   EmailConnection[];

  // ── Issues ────────────────────────────────
  issues:             DetectedIssue[];
  topIssues:          DetectedIssue[];  // Top 3 for home screen

  // ── Savings ───────────────────────────────
  savingsHistory:     SavingsEvent[];
  totalSavedAllTime:  number;
  savedThisMonth:     number;

  // ── Loading States ─────────────────────────
  isLoadingIssues:        boolean;
  isLoadingTransactions:  boolean;
  isSyncingBank:          boolean;
  isAnalyzing:            boolean;

  // ── Subscription ──────────────────────────
  subscriptionTier: SubscriptionTier;

  // ── Actions ───────────────────────────────
  setUser:                   (user: User | null) => void;
  setIsAuthenticated:        (val: boolean) => void;
  setBiometricVerified:      (val: boolean) => void;
  setOnboardingComplete:     (val: boolean) => void;
  setConnectedAccounts:      (accounts: ConnectedAccount[]) => void;
  addConnectedAccount:       (account: ConnectedAccount) => void;
  removeConnectedAccount:    (accountId: string) => void;
  setEmailConnections:       (conns: EmailConnection[]) => void;
  addEmailConnection:        (conn: EmailConnection) => void;
  setIssues:                 (issues: DetectedIssue[]) => void;
  updateIssueStatus:         (issueId: string, status: DetectedIssue['status'], amountSaved?: number) => void;
  setSavingsHistory:         (events: SavingsEvent[]) => void;
  addSavingsEvent:           (event: SavingsEvent) => void;
  setTotalSaved:             (total: number) => void;
  setSavedThisMonth:         (amount: number) => void;
  setLoadingIssues:          (val: boolean) => void;
  setLoadingTransactions:    (val: boolean) => void;
  setSyncingBank:            (val: boolean) => void;
  setAnalyzing:              (val: boolean) => void;
  setSubscriptionTier:       (tier: SubscriptionTier) => void;
  reset:                     () => void;
}

// ─────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────
const initialState = {
  user:                   null,
  isAuthenticated:        false,
  isBiometricVerified:    false,
  isOnboardingComplete:   false,
  connectedAccounts:      [],
  emailConnections:       [],
  issues:                 [],
  topIssues:              [],
  savingsHistory:         [],
  totalSavedAllTime:      0,
  savedThisMonth:         0,
  isLoadingIssues:        false,
  isLoadingTransactions:  false,
  isSyncingBank:          false,
  isAnalyzing:            false,
  subscriptionTier:       'free' as SubscriptionTier,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setUser: (user) => set({ user }),

  setIsAuthenticated: (val) => set({ isAuthenticated: val }),

  setBiometricVerified: (val) => set({ isBiometricVerified: val }),

  setOnboardingComplete: (val) => set({ isOnboardingComplete: val }),

  setConnectedAccounts: (accounts) => set({ connectedAccounts: accounts }),

  addConnectedAccount: (account) =>
    set((s) => ({ connectedAccounts: [...s.connectedAccounts, account] })),

  removeConnectedAccount: (accountId) =>
    set((s) => ({
      connectedAccounts: s.connectedAccounts.filter((a) => a.id !== accountId),
    })),

  setEmailConnections: (conns) => set({ emailConnections: conns }),

  addEmailConnection: (conn) =>
    set((s) => ({ emailConnections: [...s.emailConnections, conn] })),

  setIssues: (issues) => {
    // Automatically compute topIssues (highest monthly_cost × confidence_score)
    const sorted = [...issues]
      .filter((i) => i.status === 'new' || i.status === 'in_progress')
      .sort((a, b) =>
        b.monthly_cost * b.confidence_score - a.monthly_cost * a.confidence_score,
      )
      .slice(0, 3);
    set({ issues, topIssues: sorted });
  },

  updateIssueStatus: (issueId, status, amountSaved) =>
    set((s) => {
      const updated = s.issues.map((issue) => {
        if (issue.id !== issueId) return issue;
        return {
          ...issue,
          status,
          resolved_at:  status === 'resolved' ? new Date().toISOString() : issue.resolved_at,
          amount_saved: amountSaved ?? issue.amount_saved,
        };
      });
      // Re-compute topIssues
      const sorted = [...updated]
        .filter((i) => i.status === 'new' || i.status === 'in_progress')
        .sort((a, b) =>
          b.monthly_cost * b.confidence_score - a.monthly_cost * a.confidence_score,
        )
        .slice(0, 3);
      return { issues: updated, topIssues: sorted };
    }),

  setSavingsHistory: (events) => set({ savingsHistory: events }),

  addSavingsEvent: (event) =>
    set((s) => ({
      savingsHistory:    [event, ...s.savingsHistory],
      totalSavedAllTime: s.totalSavedAllTime + event.amount_saved,
      savedThisMonth:    isThisMonth(event.saved_at)
        ? s.savedThisMonth + event.amount_saved
        : s.savedThisMonth,
    })),

  setTotalSaved:    (total)  => set({ totalSavedAllTime: total }),
  setSavedThisMonth: (amount) => set({ savedThisMonth: amount }),

  setLoadingIssues:       (val) => set({ isLoadingIssues: val }),
  setLoadingTransactions: (val) => set({ isLoadingTransactions: val }),
  setSyncingBank:         (val) => set({ isSyncingBank: val }),
  setAnalyzing:           (val) => set({ isAnalyzing: val }),
  setSubscriptionTier:    (tier) => set({ subscriptionTier: tier }),

  reset: () => set(initialState),
}));

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
function isThisMonth(dateString: string): boolean {
  const d   = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ── Computed selectors (use these in components) ──────────────────

/** Total potential monthly savings from open issues */
export const selectPotentialMonthlySavings = (state: AppState): number =>
  state.issues
    .filter((i) => i.status === 'new' || i.status === 'in_progress')
    .reduce((sum, i) => sum + i.monthly_cost, 0);

/** Count of new (unactioned) issues */
export const selectNewIssueCount = (state: AppState): number =>
  state.issues.filter((i) => i.status === 'new').length;

/** Whether user has at least one bank connected */
export const selectHasBank = (state: AppState): boolean =>
  state.connectedAccounts.length > 0;

/** Whether user has at least one email connected */
export const selectHasEmail = (state: AppState): boolean =>
  state.emailConnections.length > 0;
