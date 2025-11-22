/**
 * Spacing System
 * Matching Tailwind's spacing scale
 */

// Base spacing unit (4px like Tailwind)
const BASE = 4;

export const spacing = {
  0: 0,
  0.5: BASE * 0.5, // 2px
  1: BASE, // 4px
  1.5: BASE * 1.5, // 6px
  2: BASE * 2, // 8px
  2.5: BASE * 2.5, // 10px
  3: BASE * 3, // 12px
  3.5: BASE * 3.5, // 14px
  4: BASE * 4, // 16px
  5: BASE * 5, // 20px
  6: BASE * 6, // 24px
  7: BASE * 7, // 28px
  8: BASE * 8, // 32px
  9: BASE * 9, // 36px
  10: BASE * 10, // 40px
  11: BASE * 11, // 44px
  12: BASE * 12, // 48px
  14: BASE * 14, // 56px
  16: BASE * 16, // 64px
  20: BASE * 20, // 80px
  24: BASE * 24, // 96px
  28: BASE * 28, // 112px
  32: BASE * 32, // 128px
} as const;

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

// Shadow presets
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
