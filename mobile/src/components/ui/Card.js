import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function Card({ children, style, elevation = 'sm' }) {
  return (
    <View
      style={[
        styles.card,
        elevation === 'md' && theme.shadows.md,
        elevation === 'lg' && theme.shadows.lg,
        elevation === 'sm' && theme.shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    overflow: 'hidden',
  },
});
