import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'category' | 'score' | 'plan' | 'neutral' | 'harmony';
  score?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ label, variant = 'category', score, style, textStyle }: BadgeProps) {
  let backgroundColor = COLORS.cardMuted;
  let textColor = COLORS.charcoal;
  let borderColor = 'transparent';

  if (variant === 'score' && typeof score === 'number') {
    if (score >= 85) {
      backgroundColor = '#ECFDF5';
      textColor = COLORS.scoreHigh;
      borderColor = '#A7F3D0';
    } else if (score >= 70) {
      backgroundColor = '#FFFBEB';
      textColor = COLORS.scoreMedium;
      borderColor = '#FDE68A';
    } else {
      backgroundColor = '#F3F4F6';
      textColor = COLORS.scoreLow;
      borderColor = '#E5E7EB';
    }
  } else if (variant === 'plan') {
    backgroundColor = '#F5F3FF';
    textColor = '#6D28D9';
    borderColor = '#DDD6FE';
  } else if (variant === 'harmony') {
    backgroundColor = '#F0F9FF';
    textColor = '#0369A1';
    borderColor = '#BAE6FD';
  }

  return (
    <View style={[styles.badge, { backgroundColor, borderColor }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
