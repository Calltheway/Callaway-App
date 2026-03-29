// ─────────────────────────────────────────────
// KEEPER — Empty State Component
// Shown when a list or section has no data yet.
// Explains to the user what will appear here and why.
// ─────────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface EmptyStateProps {
  icon?:          React.ReactNode;
  title:          string;
  description:    string;
  actionLabel?:   string;
  onAction?:      () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        alignItems:     'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
        gap: 16,
      }}
    >
      {icon && (
        <View
          style={{
            width:           72,
            height:          72,
            borderRadius:    36,
            backgroundColor: Colors.surfaceAlt,
            alignItems:      'center',
            justifyContent:  'center',
            marginBottom:    8,
          }}
        >
          {icon}
        </View>
      )}

      <Text
        style={{
          fontSize:   FontSize.lg,
          fontWeight: FontWeight.semibold,
          color:      Colors.textPrimary,
          textAlign:  'center',
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize:   FontSize.base,
          color:      Colors.textSecondary,
          textAlign:  'center',
          lineHeight: 22,
        }}
      >
        {description}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            marginTop:         8,
            paddingHorizontal: 24,
            paddingVertical:   12,
            backgroundColor:   Colors.emerald,
            borderRadius:      12,
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color:      Colors.white,
              fontWeight: FontWeight.semibold,
              fontSize:   FontSize.base,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
