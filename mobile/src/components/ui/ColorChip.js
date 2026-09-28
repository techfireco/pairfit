import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function ColorChip({ hex, size = 'sm', showHex = true }) {
  const dotSize = size === 'lg' ? 20 : size === 'md' ? 16 : 12;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: hex || '#CCCCCC',
          },
        ]}
      />
      {showHex && <Text style={styles.hexText}>{hex || 'N/A'}</Text>}
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
    borderWidth: 1,
    borderColor: '#D4D4D8',
  },
  hexText: {
    fontSize: theme.typography.xs.fontSize,
    fontFamily: 'monospace',
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
