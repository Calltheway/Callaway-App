// ─────────────────────────────────────────────
// KEEPER — Skeleton Loader
// Animated placeholder shown while content loads.
// Gives users a sense of what's coming instead of
// a blank screen.
// ─────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Animated, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface SkeletonProps {
  width?:         number | string;
  height?:        number;
  borderRadius?:  number;
  style?:         ViewStyle;
}

export function Skeleton({
  width        = '100%',
  height       = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue:         1,
          duration:        800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue:         0.3,
          duration:        800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: Colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ── Pre-built skeleton layouts ────────────────

export function IssueCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius:    16,
        padding:         16,
        marginBottom:    12,
        gap:             12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} />
        </View>
        <Skeleton width={60} height={20} borderRadius={10} />
      </View>
      <Skeleton height={12} />
      <Skeleton width="80%" height={12} />
    </View>
  );
}

export function HeroCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: Colors.navyLight,
        borderRadius:    20,
        padding:         24,
        gap:             16,
      }}
    >
      <Skeleton width="50%" height={14} borderRadius={7} />
      <Skeleton width="70%" height={40} borderRadius={8} />
      <Skeleton width="60%" height={14} borderRadius={7} />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ gap: 16, paddingHorizontal: 20 }}>
      <HeroCardSkeleton />
      <Skeleton height={20} width="40%" />
      <IssueCardSkeleton />
      <IssueCardSkeleton />
      <IssueCardSkeleton />
    </View>
  );
}
