// ─────────────────────────────────────────────
// KEEPER — Auth Hook
// Manages sign in, sign up, sign out, and
// listening for auth state changes from Supabase.
// ─────────────────────────────────────────────
import { useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { supabase, authHelpers, userDb, issuesDb, savingsDb, accountsDb, emailDb } from '@/lib/supabase';
import { getCurrentTier } from '@/lib/revenuecat';
import { clearSession } from '@/lib/biometric';
import { useAppStore } from '@/store/useAppStore';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    setUser,
    setIsAuthenticated,
    setIssues,
    setSavingsHistory,
    setTotalSaved,
    setSavedThisMonth,
    setConnectedAccounts,
    setEmailConnections,
    setSubscriptionTier,
    reset,
  } = useAppStore();

  // ── Load user data after authentication ──────
  const loadUserData = useCallback(async (userId: string) => {
    try {
      // Load all user data in parallel for speed
      const [
        profile,
        accounts,
        emails,
        issues,
        savings,
        totalSaved,
        thisMonthSaved,
        tier,
      ] = await Promise.all([
        userDb.getProfile(userId),
        accountsDb.getAll(userId),
        emailDb.getAll(userId),
        issuesDb.getAll(userId),
        savingsDb.getHistory(userId),
        savingsDb.getTotalSaved(userId),
        savingsDb.getThisMonthSaved(userId),
        getCurrentTier(),
      ]);

      setUser(profile);
      setConnectedAccounts(accounts);
      setEmailConnections(emails);
      setIssues(issues);
      setSavingsHistory(savings);
      setTotalSaved(totalSaved);
      setSavedThisMonth(thisMonthSaved);
      setSubscriptionTier(tier);
    } catch (err) {
      console.error('[useAuth] Failed to load user data:', err);
    }
  }, [
    setUser, setConnectedAccounts, setEmailConnections, setIssues,
    setSavingsHistory, setTotalSaved, setSavedThisMonth, setSubscriptionTier,
  ]);

  // ── Listen for auth state changes ────────────
  // This fires whenever the user logs in or out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          await loadUserData(session.user.id);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      },
    );

    // Check if there's an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData, setIsAuthenticated, setUser]);

  // ── Sign Up ───────────────────────────────────
  const signUp = useCallback(async (email: string, password: string) => {
    const data = await authHelpers.signUp(email, password);
    return data;
  }, []);

  // ── Sign In ───────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    const data = await authHelpers.signIn(email, password);
    return data;
  }, []);

  // ── Magic Link ────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string) => {
    await authHelpers.signInWithMagicLink(email);
  }, []);

  // ── Sign Out ──────────────────────────────────
  const signOut = useCallback(async () => {
    await clearSession();
    await authHelpers.signOut();
    reset();
    router.replace('/(auth)/welcome');
  }, [reset]);

  return {
    user,
    isAuthenticated,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    loadUserData,
  };
}
