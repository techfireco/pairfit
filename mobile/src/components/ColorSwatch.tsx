import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/theme';

interface ColorSwatchProps {
  hex: string;
  size?: number;
  showHex?: boolean;
  style?: ViewStyle;
}

export function ColorSwatch({ hex, size = 16, showHex = false, style }: ColorSwatchProps) {
  const safeHex = hex || '#888888';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: safeHex,
          },
        ]}
      />
      {showHex && <Text style={styles.hexText}>{safeHex.toUpperCase()}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  hexText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
