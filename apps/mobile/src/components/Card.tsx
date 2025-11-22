import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  children,
  ...props
}: CardProps) {
  const cardStyles = [
    styles.base,
    variantStyles[variant],
    paddingStyles[padding],
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyles,
          pressed && styles.pressed,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

const variantStyles: Record<CardVariant, ViewStyle> = {
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filled: {
    backgroundColor: colors.background.secondary,
  },
};

const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', ViewStyle> = {
  none: {},
  sm: {
    padding: spacing[3],
  },
  md: {
    padding: spacing[4],
  },
  lg: {
    padding: spacing[6],
  },
};

export default Card;
