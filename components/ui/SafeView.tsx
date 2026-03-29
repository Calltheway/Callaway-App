// ─────────────────────────────────────────────
// KEEPER — SafeView
// A wrapper that handles the notch/status bar on
// all iPhone and Android models safely.
// ─────────────────────────────────────────────
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface SafeViewProps {
  children:    React.ReactNode;
  style?:      ViewStyle;
  bg?:         string;
  edges?:      ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeView({
  children,
  style,
  bg    = Colors.surface,
  edges = ['top', 'bottom'],
}: SafeViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex:            1,
          backgroundColor: bg,
          paddingTop:      edges.includes('top')    ? insets.top    : 0,
          paddingBottom:   edges.includes('bottom') ? insets.bottom : 0,
          paddingLeft:     edges.includes('left')   ? insets.left   : 0,
          paddingRight:    edges.includes('right')  ? insets.right  : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
