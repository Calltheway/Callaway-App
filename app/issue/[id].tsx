// ─────────────────────────────────────────────
// KEEPER — Issue Detail Screen
// Full explanation of the issue, dollar amount at stake,
// and the primary action button.
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { useAnalysis } from '@/hooks/useAnalysis';
import { generateNegotiationScript } from '@/lib/claude';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow, IssueTypeConfig, ActionConfig } from '@/constants/theme';
import type { SubscriptionTier } from '@/types';

export default function IssueDetailScreen() {
  const { id }              = useLocalSearchParams<{ id: string }>();
  const { issues, subscriptionTier } = useAppStore();
  const { resolveIssue, dismissIssue } = useAnalysis();

  const issue = issues.find((i) => i.id === id);

  const [loading,       setLoading]       = useState(false);
  const [negotiationScript, setNegotiationScript] = useState('');
  const [showScript,    setShowScript]    = useState(false);

  if (!issue) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>Issue not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: Colors.emerald }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config       = IssueTypeConfig[issue.issue_type];
  const actionConfig = ActionConfig[issue.recommended_action];
  const canAct       = subscriptionTier !== 'free' || issue.action_difficulty === 'easy';

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const handlePrimaryAction = async () => {
    if (!canAct) {
      router.push('/paywall');
      return;
    }

    setLoading(true);
    try {
      switch (issue.recommended_action) {
        case 'cancel':
          await handleCancel();
          break;
        case 'negotiate':
          await handleNegotiate();
          break;
        case 'dispute':
          await handleDispute();
          break;
        case 'claim':
          await handleClaim();
          break;
        default:
          Alert.alert('Action', 'Marking as in progress...');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const url = issue.metadata?.cancellation_url;
    if (url) {
      Alert.alert(
        'Cancel subscription',
        `Keeper will open the ${issue.merchant_name} cancellation page. After you cancel, mark this as resolved.`,
        [
          { text: 'Cancel',                    style: 'cancel' },
          { text: 'Open cancellation page', onPress: async () => {
            await Linking.openURL(url);
            await resolveIssue(issue.id, issue.monthly_cost, 'cancellation', `Cancelled ${issue.merchant_name} subscription`);
          }},
        ],
      );
    } else {
      Alert.alert(
        'Cancel subscription',
        `To cancel ${issue.merchant_name}: Go to their website or app → Account Settings → Subscription → Cancel.\n\nAfter you cancel, come back and mark this resolved.`,
        [
          { text: 'Done — mark as resolved', onPress: async () => {
            await resolveIssue(issue.id, issue.monthly_cost, 'cancellation', `Cancelled ${issue.merchant_name} subscription`);
            router.back();
          }},
          { text: 'Not yet', style: 'cancel' },
        ],
      );
    }
  };

  const handleNegotiate = async () => {
    // Generate negotiation script with Claude
    if (!negotiationScript) {
      setLoading(true);
      try {
        const script = await generateNegotiationScript(
          issue.merchant_name,
          issue.monthly_cost,
          issue.plain_english_explanation,
        );
        setNegotiationScript(script);
        setShowScript(true);
      } catch {
        Alert.alert('Script unavailable', 'Could not generate negotiation script. Try calling customer service directly.');
      } finally {
        setLoading(false);
      }
    } else {
      setShowScript(!showScript);
    }
  };

  const handleDispute = async () => {
    Alert.alert(
      'Dispute this charge',
      `To dispute with ${issue.merchant_name}:\n\n1. Call the number on the back of your card\n2. Tell them you see a charge you don't recognize\n3. Request a chargeback\n\nAfter the dispute is filed, mark this as in progress.`,
      [
        { text: 'Mark as in progress', onPress: async () => {
          await useAppStore.getState().updateIssueStatus(issue.id, 'in_progress');
          router.back();
        }},
        { text: 'OK', style: 'cancel' },
      ],
    );
  };

  const handleClaim = async () => {
    Alert.alert(
      'Claim your refund',
      `Keeper found that you may be owed a refund from ${issue.merchant_name}. Tap "Open claim page" to start the process.`,
      [
        { text: 'Open claim page', onPress: async () => {
          await resolveIssue(issue.id, issue.monthly_cost, 'refund_claimed', `Claimed refund from ${issue.merchant_name}`);
          router.back();
        }},
        { text: 'Later', style: 'cancel' },
      ],
    );
  };

  const handleDismiss = () => {
    Alert.alert(
      'Dismiss this issue',
      `Are you sure? Keeper won't alert you about ${issue.merchant_name} again.`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text:    'Dismiss',
          style:   'destructive',
          onPress: async () => {
            await dismissIssue(issue.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <View
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          justifyContent:  'space-between',
          paddingHorizontal: 20,
          paddingVertical:  16,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
          backgroundColor:  Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.navy, fontSize: FontSize.base }}>← Back</Text>
        </TouchableOpacity>
        <StatusBadge status={issue.status} />
        <TouchableOpacity onPress={handleDismiss}>
          <Text style={{ color: Colors.textTertiary, fontSize: FontSize.sm }}>Dismiss</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Issue header */}
        <View style={{ backgroundColor: Colors.white, padding: 24, marginBottom: 12 }}>
          <View
            style={{
              flexDirection:  'row',
              alignItems:     'center',
              gap:            12,
              marginBottom:   20,
            }}
          >
            <View
              style={{
                width:           52,
                height:          52,
                borderRadius:    26,
                backgroundColor: `${config.color}15`,
                alignItems:      'center',
                justifyContent:  'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>💸</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color: Colors.textPrimary }}>
                {issue.merchant_name}
              </Text>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 }}>
                {config.label}
              </Text>
            </View>
          </View>

          {/* Cost breakdown */}
          <View
            style={{
              flexDirection:   'row',
              gap:             12,
            }}
          >
            <CostCard
              label="Monthly cost"
              amount={issue.monthly_cost}
              highlight
            />
            <CostCard
              label="Annual cost"
              amount={issue.annual_cost}
            />
          </View>
        </View>

        {/* What this means */}
        <View style={{ backgroundColor: Colors.white, padding: 24, marginBottom: 12 }}>
          <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 10 }}>
            What's happening
          </Text>
          <Text style={{ fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 26 }}>
            {issue.plain_english_explanation}
          </Text>

          {/* Confidence */}
          <View
            style={{
              flexDirection:     'row',
              alignItems:        'center',
              marginTop:         16,
              gap:               8,
              backgroundColor:   Colors.surfaceAlt,
              borderRadius:      BorderRadius.sm,
              padding:           10,
            }}
          >
            <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary }}>
              Keeper's confidence: {Math.round(issue.confidence_score * 100)}%
            </Text>
          </View>
        </View>

        {/* Difficulty */}
        <View style={{ backgroundColor: Colors.white, padding: 24, marginBottom: 12 }}>
          <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 10 }}>
            How hard is this to fix?
          </Text>
          <DifficultyMeter difficulty={issue.action_difficulty} />
        </View>

        {/* Negotiation script (if shown) */}
        {showScript && negotiationScript && (
          <View style={{ backgroundColor: Colors.white, padding: 24, marginBottom: 12 }}>
            <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 12 }}>
              📞 Your negotiation script
            </Text>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 }}>
              {negotiationScript}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={{
          position:          'absolute',
          bottom:            0,
          left:              0,
          right:             0,
          backgroundColor:   Colors.white,
          borderTopWidth:    1,
          borderTopColor:    Colors.border,
          paddingHorizontal: 20,
          paddingVertical:   16,
          paddingBottom:     32,
          gap:               10,
        }}
      >
        {!canAct && (
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 }}>
            Upgrade to Pro to take action on this issue
          </Text>
        )}
        <Button
          label={canAct ? actionConfig.label : `Upgrade to ${actionConfig.label}`}
          size="lg"
          fullWidth
          loading={loading && issue.recommended_action !== 'negotiate'}
          onPress={handlePrimaryAction}
          variant={canAct ? 'primary' : 'secondary'}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────
function CostCard({ label, amount, highlight }: { label: string; amount: number; highlight?: boolean }) {
  return (
    <View
      style={{
        flex:            1,
        backgroundColor: highlight ? Colors.navyLight : Colors.surfaceAlt,
        borderRadius:    BorderRadius.md,
        padding:         14,
        alignItems:      'center',
      }}
    >
      <Text style={{ fontSize: FontSize.xs, color: highlight ? 'rgba(255,255,255,0.6)' : Colors.textTertiary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontSize: FontSize.xl, fontWeight: FontWeight.heavy, color: highlight ? Colors.emerald : Colors.textPrimary }}>
        ${amount.toFixed(2)}
      </Text>
    </View>
  );
}

function DifficultyMeter({ difficulty }: { difficulty: string }) {
  const levels = [
    { key: 'easy',   label: 'Easy',   desc: 'Takes less than 2 minutes',    filled: true  },
    { key: 'medium', label: 'Medium', desc: 'Takes about 5–10 minutes',     filled: difficulty === 'medium' || difficulty === 'hard' },
    { key: 'hard',   label: 'Hard',   desc: 'May require a call or letter',  filled: difficulty === 'hard'   },
  ];

  const current = levels.find((l) => l.key === difficulty);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {levels.map((level) => (
          <View
            key={level.key}
            style={{
              flex:            1,
              height:          6,
              borderRadius:    3,
              backgroundColor: level.filled ? Colors.emerald : Colors.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary }}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} — {current?.desc}
      </Text>
    </View>
  );
}
