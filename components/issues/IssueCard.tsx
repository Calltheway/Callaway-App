// ─────────────────────────────────────────────
// KEEPER — Issue Card
// Shown in the issues feed. Each card represents
// one money problem Keeper found.
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBadge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow, IssueTypeConfig, ActionConfig } from '@/constants/theme';
import type { DetectedIssue } from '@/types';

interface IssueCardProps {
  issue: DetectedIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const config       = IssueTypeConfig[issue.issue_type];
  const actionConfig = ActionConfig[issue.recommended_action];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/issue/${issue.id}`);
  };

  const formatMoney = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.92}
      style={{
        backgroundColor: Colors.white,
        borderRadius:    BorderRadius.lg,
        padding:         16,
        marginBottom:    12,
        ...Shadow.sm,
        // Subtle left border color-coded by issue urgency
        borderLeftWidth: 3,
        borderLeftColor: config.color,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${issue.merchant_name} issue, ${formatMoney(issue.monthly_cost)} per month`}
    >
      {/* Top row: merchant name + cost */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontSize:   FontSize.md,
              fontWeight: FontWeight.semibold,
              color:      Colors.textPrimary,
            }}
            numberOfLines={1}
          >
            {issue.merchant_name}
          </Text>
          <Text
            style={{
              fontSize:  FontSize.sm,
              color:     Colors.textSecondary,
              marginTop: 2,
            }}
          >
            {config.label}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Text
            style={{
              fontSize:   FontSize.md,
              fontWeight: FontWeight.bold,
              color:      config.color,
            }}
          >
            {formatMoney(issue.monthly_cost)}/mo
          </Text>
          <StatusBadge status={issue.status} size="sm" />
        </View>
      </View>

      {/* Explanation */}
      <Text
        style={{
          fontSize:   FontSize.sm,
          color:      Colors.textSecondary,
          marginTop:  10,
          lineHeight: 20,
        }}
        numberOfLines={2}
      >
        {issue.plain_english_explanation}
      </Text>

      {/* Bottom row: action + annual cost */}
      <View
        style={{
          flexDirection:  'row',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginTop:      12,
          paddingTop:     12,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        }}
      >
        <View
          style={{
            flexDirection:     'row',
            alignItems:        'center',
            gap:               6,
            backgroundColor:   `${actionConfig.color}15`,
            borderRadius:      BorderRadius.full,
            paddingHorizontal: 10,
            paddingVertical:   5,
          }}
        >
          <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: actionConfig.color }}>
            {actionConfig.label}
          </Text>
        </View>

        <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary }}>
          {formatMoney(issue.annual_cost)} / year
        </Text>
      </View>
    </TouchableOpacity>
  );
}
