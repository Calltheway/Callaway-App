// ─────────────────────────────────────────────
// KEEPER — Button Component
// ─────────────────────────────────────────────
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?:     ButtonVariant;
  size?:        ButtonSize;
  label:        string;
  loading?:     boolean;
  fullWidth?:   boolean;
  icon?:        React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant      = 'primary',
  size         = 'md',
  label,
  loading      = false,
  fullWidth    = false,
  icon,
  iconPosition = 'left',
  disabled,
  onPress,
  ...rest
}: ButtonProps) {
  const handlePress = async (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const containerStyle = {
    ...variantStyles[variant].container,
    ...sizeStyles[size].container,
    ...(fullWidth ? { width: '100%' as const } : {}),
    ...(disabled || loading ? { opacity: 0.5 } : {}),
  };

  const textStyle = {
    ...variantStyles[variant].text,
    ...sizeStyles[size].text,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled ?? loading}
      activeOpacity={0.8}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.navy}
          size="small"
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyle}>{label}</Text>
          {icon && iconPosition === 'right' && icon}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────
const variantStyles: Record<ButtonVariant, { container: object; text: object }> = {
  primary: {
    container: {
      backgroundColor: Colors.emerald,
      borderRadius:    BorderRadius.md,
      alignItems:      'center' as const,
      justifyContent:  'center' as const,
    },
    text: {
      color:      Colors.white,
      fontWeight: FontWeight.semibold,
    },
  },
  secondary: {
    container: {
      backgroundColor: Colors.navy,
      borderRadius:    BorderRadius.md,
      alignItems:      'center' as const,
      justifyContent:  'center' as const,
    },
    text: {
      color:      Colors.white,
      fontWeight: FontWeight.semibold,
    },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderRadius:    BorderRadius.md,
      borderWidth:     1.5,
      borderColor:     Colors.navy,
      alignItems:      'center' as const,
      justifyContent:  'center' as const,
    },
    text: {
      color:      Colors.navy,
      fontWeight: FontWeight.semibold,
    },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderRadius:    BorderRadius.md,
      alignItems:      'center' as const,
      justifyContent:  'center' as const,
    },
    text: {
      color:      Colors.navy,
      fontWeight: FontWeight.medium,
    },
  },
  danger: {
    container: {
      backgroundColor: Colors.error,
      borderRadius:    BorderRadius.md,
      alignItems:      'center' as const,
      justifyContent:  'center' as const,
    },
    text: {
      color:      Colors.white,
      fontWeight: FontWeight.semibold,
    },
  },
};

const sizeStyles: Record<ButtonSize, { container: object; text: object }> = {
  sm: {
    container: { paddingHorizontal: 16, paddingVertical: 10, minHeight: 40 },
    text:      { fontSize: FontSize.sm },
  },
  md: {
    container: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 50 },
    text:      { fontSize: FontSize.base },
  },
  lg: {
    container: { paddingHorizontal: 32, paddingVertical: 18, minHeight: 58 },
    text:      { fontSize: FontSize.md },
  },
};
