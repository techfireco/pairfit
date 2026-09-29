import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Recommendation, Item, CATEGORY_LABELS } from '../types';
import { COLORS, SHADOWS } from '../constants/theme';
import { Badge } from './Badge';
import { ColorSwatch } from './ColorSwatch';
import { Sparkles, Check } from 'lucide-react-native';
import { analyzePairing, getColorName } from '../utils/colorTheory';

interface MatchCardProps {
  recommendation: Recommendation;
  anchorItem?: Item | null;
}

function MatchCardComponent({ recommendation, anchorItem }: MatchCardProps) {
  const { item, score: rawScore, reasons: rawReasons } = recommendation;
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  // Derive differentiated analysis naming the actual garments' colors
  const analysis = anchorItem
    ? analyzePairing(anchorItem, item, rawScore, rawReasons)
    : null;

  const displayScore = analysis ? analysis.score : rawScore;
  const displayBadge = analysis ? analysis.badge : 'Color Match';
  const displayReasons = analysis ? analysis.reasons : rawReasons;
  const colorName = getColorName(item.h, item.s, item.l, item.colorHex);

  const scoreFillColor =
    displayScore >= 88
      ? COLORS.scoreHigh
      : displayScore >= 70
      ? COLORS.scoreMedium
      : COLORS.scoreLow;

  return (
    <View style={[styles.card, SHADOWS.card]}>
      <View style={styles.contentRow}>
        <View
          style={[
            styles.thumbnailContainer,
            item.colorHex ? { backgroundColor: `${item.colorHex}18` } : null,
          ]}
        >
          <Image
            source={{ uri: item.thumbnailUrl || item.photoUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={100}
            recyclingKey={item.id}
          />
        </View>

        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {item.name || 'Matching Piece'}
              </Text>
              <View style={styles.metaRow}>
                <Badge label={categoryLabel} variant="category" />
                <ColorSwatch hex={item.colorHex} size={12} showHex />
                <Text style={styles.colorNameLabel} numberOfLines={1}>
                  {colorName}
                </Text>
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <View style={[styles.scoreBadge, { borderColor: scoreFillColor }]}>
                <Text style={[styles.scoreNumber, { color: scoreFillColor }]}>
                  {displayScore}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
          </View>

          <View style={styles.harmonyRow}>
            <Badge label={displayBadge} variant="harmony" />
          </View>
        </View>
      </View>

      {/* Lightweight Score Bar */}
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${Math.min(displayScore, 100)}%`, backgroundColor: scoreFillColor },
          ]}
        />
      </View>

      {/* Plain-English Reasons (Tailored per pair) */}
      <View style={styles.reasonsBox}>
        <View style={styles.reasonsHeader}>
          <Sparkles size={12} color={COLORS.obsidian} />
          <Text style={styles.reasonsTitle}>Why this works</Text>
        </View>
        {displayReasons.map((reason, idx) => (
          <View key={idx} style={styles.reasonItem}>
            <View style={styles.reasonBullet}>
              <Check size={11} color={COLORS.scoreHigh} />
            </View>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export const MatchCard = memo(MatchCardComponent, (prev, next) => {
  return (
    prev.recommendation.item.id === next.recommendation.item.id &&
    prev.recommendation.score === next.recommendation.score &&
    prev.recommendation.item.photoUrl === next.recommendation.item.photoUrl &&
    prev.anchorItem?.id === next.anchorItem?.id &&
    prev.anchorItem?.photoUrl === next.anchorItem?.photoUrl
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 14,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  thumbnailContainer: {
    width: 76,
    height: 76,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.cardMuted,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorNameLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
    borderWidth: 1.5,
    backgroundColor: '#FAF9F6',
  },
  scoreNumber: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 9.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 1,
  },
  harmonyRow: {
    marginTop: 5,
  },
  scoreBarTrack: {
    height: 4,
    borderRadius: 9999,
    backgroundColor: COLORS.cardMuted,
    overflow: 'hidden',
    marginBottom: 10,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  reasonsBox: {
    backgroundColor: COLORS.canvas,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reasonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  reasonsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.obsidian,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 4,
  },
  reasonBullet: {
    marginTop: 2.5,
  },
  reasonText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: COLORS.charcoal,
    fontWeight: '500',
  },
});
