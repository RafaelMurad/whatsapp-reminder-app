import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../theme';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  onDismiss?: () => void;
  style?: ViewStyle;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const variantConfig: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: {
    bg: colors.success.light,
    border: colors.success.main,
    text: colors.success.dark,
    icon: 'checkmark-circle',
  },
  warning: {
    bg: colors.warning.light,
    border: colors.warning.main,
    text: colors.warning.dark,
    icon: 'warning',
  },
  error: {
    bg: colors.error.light,
    border: colors.error.dark,
    text: colors.error.dark,
    icon: 'alert-circle',
  },
  info: {
    bg: colors.info.light,
    border: colors.info.main,
    text: colors.info.dark,
    icon: 'information-circle',
  },
};

export function Alert({
  title,
  message,
  variant = 'info',
  onDismiss,
  action,
  style,
}: AlertProps) {
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderLeftColor: config.border,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={24} color={config.text} />
      </View>

      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: config.text }]}>{title}</Text>
        )}
        <Text style={[styles.message, { color: config.text }]}>{message}</Text>

        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: config.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Ionicons name="close" size={20} color={config.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing[4],
  },
  iconContainer: {
    marginRight: spacing[3],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[1],
  },
  message: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  dismissButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  actionButton: {
    marginTop: spacing[2],
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});

export default Alert;
