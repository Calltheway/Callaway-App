// ─────────────────────────────────────────────
// KEEPER — Card Component
// ─────────────────────────────────────────────
import React from 'react';
import {
  View,
  TouchableOpacity,
  type ViewStyle,
  type TouchableOpacityProps,
} from 'react-native';
import { Colors, BorderRadius, Shadow } from '@/constants/theme';

interface CardProps {
  children:    React.ReactNode;
  style?:      ViewStyle;
  onPress?:    TouchableOpacityProps['onPress'];
  padding?:    number;
  shadow?:     keyof typeof Shadow;
  borderColor?: string;
}

export function Card({
  children,
  style,
  onPress,
  padding    = 16,
  shadow     = 'md',
  borderColor,
}: CardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: Colors.white,
    borderRadius:    BorderRadius.lg,
    padding,
    ...Shadow[shadow],
    ...(borderColor ? { borderWidth: 1, borderColor } : {}),
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}
