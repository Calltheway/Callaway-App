// ─────────────────────────────────────────────
// KEEPER — Savings History (Tab 3)
// Timeline of everything Keeper has recovered.
// Running total + shareable savings card.
// ─────────────────────────────────────────────
import React, { useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppStore } from '@/store/useAppStore';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '@/constants/theme';
import type { SavingsEvent } from '@/types';
import { format } from 'date-fns';

const METHOD_CONFIG = {
  cancellation:   { label: 'Cancelled',        emoji: '✂️', color: Colors.error    },
  negotiation:    { label: 'Negotiated',        emoji: '📞', color: Colors.emerald  },
  dispute_won:    { label: 'Dispute Won',       emoji: '⚖️', color: Colors.info     },
  refund_claimed: { label: 'Refund Claimed',    emoji: '💰', color: Colors.success  },
  manual:         { label: 'Manually Resolved', emoji: '✓',  color: Colors.emerald  },
} as const;

export default function HistoryScreen() {
  const { savingsHistory, totalSavedAllTime, savedThisMonth } = useAppStore();

  const handleShareCard = async () => {
    try {
      await Share.share({
        message: `I saved $${totalSavedAllTime.toFixed(0)} with Keeper — the AI money agent that finds and recovers money you're losing every month. Try it free: https://getkeeper.app`,
        title:   'I saved money with Keeper!',
      });
    } catch {
      // User cancelled share
    }
  };

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <FlatList
        data={savingsHistory}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
              <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.heavy, color: Colors.navy }}>
                Savings History
              </Text>
            </View>

            {/* Total Saved Card */}
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <LinearGradient
                colors={[Colors.emerald, Colors.emeraldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: BorderRadius.xl, padding: 24, ...Shadow.lg }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, fontWeight: FontWeight.medium, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Total Saved with Keeper
                </Text>
                <Text style={{ color: Colors.white, fontSize: 48, fontWeight: FontWeight.heavy, marginBottom: 4 }}>
                  {formatMoney(totalSavedAllTime)}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: FontSize.base }}>
                  {formatMoney(savedThisMonth)} saved this month
                </Text>

                {/* Share button */}
                {totalSavedAllTime > 0 && (
                  <TouchableOpacity
                    onPress={handleShareCard}
                    activeOpacity={0.85}
                    style={{
                      marginTop:         20,
                      backgroundColor:   'rgba(255,255,255,0.2)',
                      borderRadius:      BorderRadius.md,
                      paddingVertical:   12,
                      paddingHorizontal: 20,
                      alignSelf:         'flex-start',
                      flexDirection:     'row',
                      alignItems:        'center',
                      gap:               8,
                    }}
                  >
                    <Text style={{ color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold }}>
                      Share my savings 🎉
                    </Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>

            {savingsHistory.length > 0 && (
              <Text style={{ paddingHorizontal: 20, fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 12 }}>
                Transaction history
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => <SavingsEventRow event={item} />}
        ListEmptyComponent={
          <EmptyState
            title="No savings recorded yet"
            description="When Keeper helps you cancel a subscription, win a dispute, or claim a refund, it will appear here. Your total savings add up over time."
          />
        }
      />
    </SafeAreaView>
  );
}

function SavingsEventRow({ event }: { event: SavingsEvent }) {
  const method = METHOD_CONFIG[event.method] ?? METHOD_CONFIG.manual;
  const date   = new Date(event.saved_at);

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <View
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        paddingHorizontal: 20,
        paddingVertical:   16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap:               14,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width:           48,
          height:          48,
          borderRadius:    24,
          backgroundColor: `${method.color}15`,
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <Text style={{ fontSize: 22 }}>{method.emoji}</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary }} numberOfLines={1}>
          {event.merchant_name}
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
          {event.description}
        </Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 4 }}>
          {format(date, 'MMM d, yyyy')} · {method.label}
        </Text>
      </View>

      {/* Amount */}
      <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.emerald }}>
        +{formatMoney(event.amount_saved)}
      </Text>
    </View>
  );
}
