// ─────────────────────────────────────────────
// KEEPER — Action Card (Home Screen)
// Compact opportunity card for the home dashboard.
// Shows the top 3 money opportunities.
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow, IssueTypeConfig, ActionConfig } from '@/constants/theme';
import type { DetectedIssue } from '@/types';

interface ActionCardProps {
  issue: DetectedIssue;
  rank:  number;  // 1, 2, 3
}

export function ActionCard({ issue, rank }: ActionCardProps) {
  const config       = IssueTypeConfig[issue.issue_type];
  const actionConfig = ActionConfig[issue.recommended_action];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/issue/${issue.id}`);
  };

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const difficultyLabel: Record<string, string> = {
    easy:   '✓ Easy fix',
    medium: '~ Takes 5 min',
    hard:   '○ Takes effort',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={{
        backgroundColor: Colors.white,
        borderRadius:    BorderRadius.lg,
        padding:         16,
        ...Shadow.sm,
        flexDirection:   'row',
        alignItems:      'center',
        gap:             14,
        marginBottom:    10,
      }}
    >
      {/* Rank indicator */}
      <View
        style={{
          width:           36,
          height:          36,
          borderRadius:    18,
          backgroundColor: rank === 1 ? Colors.emerald : Colors.surfaceAlt,
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <Text
          style={{
            color:      rank === 1 ? Colors.white : Colors.textSecondary,
            fontSize:   FontSize.base,
            fontWeight: FontWeight.bold,
          }}
        >
          {rank}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary }} numberOfLines={1}>
          {issue.merchant_name}
        </Text>
        <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
          {config.label}
        </Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.emeraldDark, marginTop: 4, fontWeight: FontWeight.medium }}>
          {difficultyLabel[issue.action_difficulty]}
        </Text>
      </View>

      {/* Cost */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: FontSize.base, fontWeight: FontWeight.bold, color: config.color }}>
          {formatMoney(issue.monthly_cost)}
        </Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>
          /month
        </Text>
      </View>
    </TouchableOpacity>
  );
}
