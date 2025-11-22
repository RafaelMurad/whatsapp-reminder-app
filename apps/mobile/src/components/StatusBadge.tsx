import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string; icon: string }> = {
  success: {
    bg: colors.success.light,
    text: colors.success.dark,
    icon: colors.success.main,
  },
  warning: {
    bg: colors.warning.light,
    text: colors.warning.dark,
    icon: colors.warning.main,
  },
  error: {
    bg: colors.error.light,
    text: colors.error.dark,
    icon: colors.error.main,
  },
  info: {
    bg: colors.info.light,
    text: colors.info.dark,
    icon: colors.info.main,
  },
  neutral: {
    bg: colors.gray[100],
    text: colors.gray[700],
    icon: colors.gray[500],
  },
};

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
}: StatusBadgeProps) {
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        { backgroundColor: config.bg },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 12 : 14}
          color={config.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          { color: config.text },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    borderRadius: borderRadius.full,
  },
  sizeSm: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
  },
  sizeMd: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
  },
  text: {
    fontWeight: fontWeight.medium,
  },
  textSm: {
    fontSize: fontSize.xs,
  },
  textMd: {
    fontSize: fontSize.sm,
  },
});

export default StatusBadge;
