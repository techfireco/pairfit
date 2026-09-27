import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_LABELS } from '../config';
import { theme } from '../styles/theme';

export default function RecommendationCard({ recommendation }) {
  const { item, score, reasons } = recommendation;
  const [imgLoading, setImgLoading] = useState(true);

  // Score badge coloring based on color theory tiers
  const getScoreColor = (val) => {
    if (val >= 90) return '#059669'; // High emerald
    if (val >= 80) return '#2563EB'; // Royal blue
    if (val >= 70) return '#D97706'; // Amber
    return '#DC2626'; // Red
  };

  const scoreColor = getScoreColor(score);
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {imgLoading && (
          <View style={styles.imgLoader}>
            <ActivityIndicator size="small" color={theme.colors.textMuted} />
          </View>
        )}
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.image}
          resizeMode="cover"
          onLoadEnd={() => setImgLoading(false)}
        />
        <View style={[styles.swatchDot, { backgroundColor: item.colorHex || '#ccc' }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name || 'Untitled'}
            </Text>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>
          </View>

          <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
            <Text style={[styles.scoreSub, { color: scoreColor }]}>/100</Text>
          </View>
        </View>

        {/* Visual score fill bar */}
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, Math.max(10, score))}%`, backgroundColor: scoreColor },
            ]}
          />
        </View>

        {/* Reasons list */}
        <View style={styles.reasonsList}>
          {reasons?.map((reason, idx) => (
            <View key={idx} style={styles.reasonRow}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" style={styles.checkIcon} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: '#ECECEC',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imgLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  swatchDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
  },
  scoreSub: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 1,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  reasonsList: {
    gap: 3,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkIcon: {
    marginTop: 1,
  },
  reasonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
