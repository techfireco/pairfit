import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function ScoreBadge({ score, showBar = true }) {
  const getScoreColor = (val) => {
    if (val >= 90) return '#059669'; // Emerald
    if (val >= 80) return '#2563EB'; // Royal Blue
    if (val >= 70) return '#D97706'; // Amber
    return '#DC2626'; // Red
  };

  const color = getScoreColor(score);

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: color + '15' }]}>
        <Text style={[styles.scoreValue, { color }]}>{score}</Text>
        <Text style={[styles.scoreScale, { color }]}>/100</Text>
      </View>
      {showBar && (
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, Math.max(8, score))}%`, backgroundColor: color },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  scoreValue: {
    fontSize: theme.typography.base.fontSize,
    fontWeight: '800',
  },
  scoreScale: {
    fontSize: theme.typography.xs.fontSize - 1,
    fontWeight: '700',
    marginLeft: 1,
  },
  barTrack: {
    width: 60,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
