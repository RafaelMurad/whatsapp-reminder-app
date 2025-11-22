import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from './Typography';
import { colors, spacing } from '../theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function Loading({
  size = 'large',
  color = colors.primary[500],
  message,
  fullScreen = false,
  style,
}: LoadingProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Typography
          variant="bodySmall"
          color={colors.text.secondary}
          style={styles.message}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  message: {
    marginTop: spacing[3],
  },
});

export default Loading;
