import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[`size_${size}`],
    variantStyles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    variantTextStyles[variant],
    isDisabled && styles.textDisabled,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[500] : colors.white}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'gradient' && !isDisabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        style={[styles.gradientWrapper, fullWidth && styles.fullWidth, style]}
        {...props}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.secondary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[`size_${size}`]]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      style={buttonStyles}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    minHeight: 32,
  },
  size_md: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    minHeight: 40,
  },
  size_lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    minHeight: 48,
  },

  // Text base
  text: {
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.7,
  },

  // Text sizes
  text_sm: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  text_md: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  text_lg: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },

  // Gradient wrapper
  gradientWrapper: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary[600],
  },
  secondary: {
    backgroundColor: colors.gray[600],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary[500],
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: colors.error.dark,
  },
  gradient: {
    backgroundColor: 'transparent',
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.white,
  },
  secondary: {
    color: colors.white,
  },
  outline: {
    color: colors.primary[600],
  },
  ghost: {
    color: colors.primary[600],
  },
  danger: {
    color: colors.white,
  },
  gradient: {
    color: colors.white,
  },
};

export default Button;
