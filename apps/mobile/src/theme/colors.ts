/**
 * Design System Colors
 * Matching the web app's Tailwind color palette
 */

export const colors = {
  // Primary - Blue (main actions, links, highlights)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary color
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary - Purple (accents, gradients)
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA', // Main secondary color
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Gray - Neutral (text, backgrounds, borders)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic colors
  success: {
    light: '#DCFCE7', // green-100
    main: '#22C55E', // green-500
    dark: '#166534', // green-800
  },

  warning: {
    light: '#FEF3C7', // yellow-100
    main: '#F59E0B', // yellow-500
    dark: '#92400E', // yellow-800
  },

  error: {
    light: '#FEE2E2', // red-50/100
    main: '#EF4444', // red-500
    dark: '#DC2626', // red-600
  },

  info: {
    light: '#DBEAFE', // blue-100
    main: '#3B82F6', // blue-500
    dark: '#1D4ED8', // blue-700
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB', // gray-50
    tertiary: '#F3F4F6', // gray-100
  },

  // Text colors
  text: {
    primary: '#111827', // gray-900
    secondary: '#4B5563', // gray-600
    tertiary: '#6B7280', // gray-500
    inverse: '#FFFFFF',
    muted: '#9CA3AF', // gray-400
  },

  // Border colors
  border: {
    light: '#E5E7EB', // gray-200
    default: '#D1D5DB', // gray-300
    dark: '#9CA3AF', // gray-400
  },

  // WhatsApp brand color
  whatsapp: {
    main: '#25D366',
    dark: '#128C7E',
  },

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Gradient presets matching web app
export const gradients = {
  primary: ['#3B82F6', '#9333EA'], // blue-500 to purple-600
  secondary: ['#60A5FA', '#A855F7'], // blue-400 to purple-500
  success: ['#22C55E', '#16A34A'], // green-500 to green-600
  sunset: ['#F59E0B', '#EF4444'], // yellow-500 to red-500
} as const;

export type ColorScheme = typeof colors;
export type GradientScheme = typeof gradients;
