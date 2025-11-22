/**
 * Theme System - Main Export
 * Provides consistent design tokens across the app
 */

export { colors, gradients } from './colors';
export type { ColorScheme, GradientScheme } from './colors';

export { fontSize, fontFamily, fontWeight, lineHeight, textStyles } from './typography';
export type { TextStyleName } from './typography';

export { spacing, borderRadius, shadows } from './spacing';
export type { SpacingKey, BorderRadiusKey, ShadowKey } from './spacing';

// Re-export everything as a unified theme object
import { colors, gradients } from './colors';
import { fontSize, fontFamily, fontWeight, lineHeight, textStyles } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  gradients,
  fontSize,
  fontFamily,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

// Common style helpers
export const commonStyles = {
  // Container styles
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing[4],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Card styles (matching web's bg-white shadow rounded-lg)
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.md,
  },
  cardLarge: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[6],
    ...shadows.lg,
  },

  // Row layouts
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },

  // Input styles (matching web form inputs)
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: fontSize.sm,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error.main,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
};
