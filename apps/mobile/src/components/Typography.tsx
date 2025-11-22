import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { colors, textStyles, TextStyleName } from '../theme';

interface TypographyProps extends RNTextProps {
  variant?: TextStyleName;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = colors.text.primary,
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <RNText
      style={[
        textStyles[variant],
        { color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenient preset components
export function Heading1({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" style={style} {...props} />;
}

export function Heading2({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" style={style} {...props} />;
}

export function Heading3({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" style={style} {...props} />;
}

export function Heading4({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h4" style={style} {...props} />;
}

export function BodyText({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" style={style} {...props} />;
}

export function BodySmall({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="bodySmall" color={colors.text.secondary} style={style} {...props} />;
}

export function Label({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" color={colors.text.secondary} style={style} {...props} />;
}

export function Caption({ style, ...props }: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" color={colors.text.tertiary} style={style} {...props} />;
}

export function ErrorText({ style, children, ...props }: Omit<TypographyProps, 'variant'>) {
  return (
    <Typography variant="bodySmall" color={colors.error.main} style={style} {...props}>
      {children}
    </Typography>
  );
}

export default Typography;
