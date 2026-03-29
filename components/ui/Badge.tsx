// ─────────────────────────────────────────────
// KEEPER — Badge Component
// Status tags like "New", "In Progress", "Resolved"
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text } from 'react-native';
import { StatusConfig } from '@/constants/theme';
import type { IssueStatus } from '@/types';

interface StatusBadgeProps {
  status: IssueStatus;
  size?:  'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = StatusConfig[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={{
        backgroundColor:  config.bg,
        borderRadius:     100,
        paddingHorizontal: isSmall ? 8 : 12,
        paddingVertical:   isSmall ? 3 : 5,
        alignSelf:        'flex-start',
      }}
    >
      <Text
        style={{
          color:      config.color,
          fontSize:   isSmall ? 11 : 12,
          fontWeight: '600',
          letterSpacing: 0.3,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}

// ── Generic colored badge ─────────────────────
interface BadgeProps {
  label:  string;
  color:  string;
  bg:     string;
  size?:  'sm' | 'md';
}

export function Badge({ label, color, bg, size = 'md' }: BadgeProps) {
  const isSmall = size === 'sm';
  return (
    <View
      style={{
        backgroundColor:   bg,
        borderRadius:      100,
        paddingHorizontal: isSmall ? 8 : 12,
        paddingVertical:   isSmall ? 3 : 5,
        alignSelf:         'flex-start',
      }}
    >
      <Text
        style={{
          color,
          fontSize:     isSmall ? 11 : 12,
          fontWeight:   '600',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
