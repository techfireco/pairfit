import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useThemedStyles, Theme, TYPE, RADIUS, MAX_FONT_SCALE } from '../theme';

type BadgeVariant = 'category' | 'plan' | 'neutral' | 'harmony';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({ label, variant = 'category', style, textStyle }: BadgeProps) {
  const styles = useThemedStyles(makeStyles);
  const isAccent = variant === 'plan' || variant === 'harmony';

  return (
    <View style={[styles.badge, isAccent ? styles.accent : styles.quiet, style]}>
      <Text
        style={[styles.text, isAccent ? styles.accentText : styles.quietText, textStyle]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
    quiet: {
      backgroundColor: colors.surfaceSunken,
      borderColor: colors.border,
    },
    accent: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accentEdge,
    },
    text: {
      ...TYPE.caption,
      fontSize: 12,
      lineHeight: 16,
    },
    quietText: {
      color: colors.textSecondary,
    },
    accentText: {
      color: colors.accentText,
    },
  });
