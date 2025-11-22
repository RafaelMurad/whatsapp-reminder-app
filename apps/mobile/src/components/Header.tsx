import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from './Typography';
import { colors, spacing, gradients } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  variant?: 'default' | 'gradient' | 'transparent';
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  variant = 'default',
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <>
      <StatusBar
        barStyle={variant === 'gradient' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={[styles.container, { paddingTop: insets.top + spacing[2] }]}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={variant === 'gradient' ? colors.white : colors.text.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <Typography
            variant="h4"
            color={variant === 'gradient' ? colors.white : colors.text.primary}
            align="center"
            numberOfLines={1}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color={variant === 'gradient' ? 'rgba(255,255,255,0.8)' : colors.text.tertiary}
              align="center"
              numberOfLines={1}
            >
              {subtitle}
            </Typography>
          )}
        </View>

        <View style={styles.rightSection}>
          {rightAction && (
            <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
              <Ionicons
                name={rightAction.icon}
                size={24}
                color={variant === 'gradient' ? colors.white : colors.primary[600]}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientWrapper}
      >
        {content}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        variant === 'transparent' && styles.transparentWrapper,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  gradientWrapper: {
    // No border for gradient
  },
  transparentWrapper: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing[1],
    marginLeft: -spacing[1],
  },
  actionButton: {
    padding: spacing[1],
    marginRight: -spacing[1],
  },
});

export default Header;
