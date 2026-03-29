// ─────────────────────────────────────────────
// KEEPER — Home Dashboard (Tab 1)
// The main screen. Shows the hero card with total
// issues + potential savings, then the top 3 actions.
// ─────────────────────────────────────────────
import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroCard } from '@/components/home/HeroCard';
import { ActionCard } from '@/components/home/ActionCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore, selectPotentialMonthlySavings, selectNewIssueCount } from '@/store/useAppStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import { authenticateWithBiometrics, isSessionValid } from '@/lib/biometric';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

export default function HomeScreen() {
  const {
    user,
    topIssues,
    issues,
    savedThisMonth,
    isAnalyzing,
    isSyncingBank,
    isBiometricVerified,
    setBiometricVerified,
  } = useAppStore();

  const monthlySavings  = useAppStore(selectPotentialMonthlySavings);
  const newIssueCount   = useAppStore(selectNewIssueCount);
  const { runAnalysis } = useAnalysis();

  const isLoading = isAnalyzing || isSyncingBank;

  // ── Biometric gate ─────────────────────────
  useEffect(() => {
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    if (isBiometricVerified) return;

    const sessionValid = await isSessionValid();
    if (sessionValid) {
      setBiometricVerified(true);
      return;
    }

    const result = await authenticateWithBiometrics(
      'Verify your identity to view your financial data',
    );
    setBiometricVerified(result.success);
  };

  // ── Pull-to-refresh ────────────────────────
  const handleRefresh = useCallback(async () => {
    try {
      await runAnalysis();
    } catch (err) {
      console.error('[Home] Refresh failed:', err);
    }
  }, [runAnalysis]);

  // ── Biometric lock screen ──────────────────
  if (!isBiometricVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.navy }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 24 }}>🔒</Text>
          <Text style={{ color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold, textAlign: 'center', marginBottom: 12 }}>
            Locked
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: FontSize.base, textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
            Verify your identity to view your financial data
          </Text>
          <TouchableOpacity
            onPress={checkBiometricAuth}
            style={{
              backgroundColor: Colors.emerald,
              borderRadius:    12,
              paddingHorizontal: 32,
              paddingVertical:   16,
            }}
          >
            <Text style={{ color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.base }}>
              Unlock with Face ID
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.emerald}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection:   'row',
            alignItems:      'center',
            justifyContent:  'space-between',
            paddingHorizontal: 20,
            paddingVertical:  20,
          }}
        >
          <View>
            <Text style={{ color: Colors.textSecondary, fontSize: FontSize.sm }}>
              Good morning
            </Text>
            <Text style={{ color: Colors.navy, fontSize: FontSize.lg, fontWeight: FontWeight.bold }}>
              {user?.full_name?.split(' ')[0] ?? 'there'} 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/settings')}
            style={{
              width:           40,
              height:          40,
              borderRadius:    20,
              backgroundColor: Colors.navy,
              alignItems:      'center',
              justifyContent:  'center',
            }}
          >
            <Text style={{ color: Colors.white, fontSize: 16 }}>⚙</Text>
          </TouchableOpacity>
        </View>

        {isLoading && issues.length === 0 ? (
          <DashboardSkeleton />
        ) : (
          <View style={{ paddingHorizontal: 20, gap: 24 }}>
            {/* Hero Card */}
            <HeroCard
              issueCount={issues.filter((i) => i.status === 'new' || i.status === 'in_progress').length}
              monthlyCost={monthlySavings}
              savedThisMonth={savedThisMonth}
            />

            {/* Top opportunities */}
            {topIssues.length > 0 ? (
              <View>
                <View
                  style={{
                    flexDirection:   'row',
                    alignItems:      'center',
                    justifyContent:  'space-between',
                    marginBottom:    14,
                  }}
                >
                  <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>
                    Top opportunities
                  </Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/issues')}>
                    <Text style={{ fontSize: FontSize.sm, color: Colors.emerald, fontWeight: FontWeight.semibold }}>
                      See all {issues.length}
                    </Text>
                  </TouchableOpacity>
                </View>

                {topIssues.map((issue, i) => (
                  <ActionCard key={issue.id} issue={issue} rank={i + 1} />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No issues found yet"
                description="Keeper will scan your accounts daily. Connect a bank account to see your first results."
                actionLabel="Connect bank"
                onAction={() => router.push('/(tabs)/settings')}
              />
            )}

            {/* Quick stats */}
            {issues.length > 0 && (
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius:    16,
                  padding:         20,
                  flexDirection:   'row',
                  justifyContent:  'space-around',
                }}
              >
                <StatItem
                  label="Open issues"
                  value={String(newIssueCount)}
                  color={Colors.error}
                />
                <View style={{ width: 1, backgroundColor: Colors.border }} />
                <StatItem
                  label="Resolved"
                  value={String(issues.filter((i) => i.status === 'resolved').length)}
                  color={Colors.emerald}
                />
                <View style={{ width: 1, backgroundColor: Colors.border }} />
                <StatItem
                  label="Saved / mo"
                  value={`$${savedThisMonth.toFixed(0)}`}
                  color={Colors.emerald}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color }}>
        {value}
      </Text>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}
