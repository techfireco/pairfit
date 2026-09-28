import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Recommendation, CATEGORY_LABELS } from '../types';
import { COLORS, SHADOWS } from '../constants/theme';
import { Badge } from './Badge';
import { ColorSwatch } from './ColorSwatch';
import { Sparkles, Check } from 'lucide-react-native';

interface MatchCardProps {
  recommendation: Recommendation;
}

export function MatchCard({ recommendation }: MatchCardProps) {
  const { item, score, reasons } = recommendation;
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  // Determine harmony badge label from reasons
  let harmonyLabel = 'Color Harmony';
  if (reasons.some((r) => r.toLowerCase().includes('complementary'))) {
    harmonyLabel = 'Complementary Contrast';
  } else if (reasons.some((r) => r.toLowerCase().includes('monochrome'))) {
    harmonyLabel = 'Monochrome Tone';
  } else if (reasons.some((r) => r.toLowerCase().includes('analogous'))) {
    harmonyLabel = 'Analogous Blend';
  } else if (reasons.some((r) => r.toLowerCase().includes('triadic'))) {
    harmonyLabel = 'Triadic Balance';
  } else if (reasons.some((r) => r.toLowerCase().includes('neutral'))) {
    harmonyLabel = 'Neutral Anchor';
  }

  const scoreFillColor =
    score >= 85 ? COLORS.scoreHigh : score >= 70 ? COLORS.scoreMedium : COLORS.scoreLow;

  return (
    <View style={[styles.card, SHADOWS.card]}>
      <View style={styles.contentRow}>
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title} numberOfLines={1}>
                {item.name || 'Matching Piece'}
              </Text>
              <View style={styles.metaRow}>
                <Badge label={categoryLabel} variant="category" />
                <ColorSwatch hex={item.colorHex} size={12} showHex />
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <View style={[styles.scoreBadge, { borderColor: scoreFillColor }]}>
                <Text style={[styles.scoreNumber, { color: scoreFillColor }]}>
                  {score}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
          </View>

          <View style={styles.harmonyRow}>
            <Badge label={harmonyLabel} variant="harmony" />
          </View>
        </View>
      </View>

      {/* Score bar */}
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${Math.min(score, 100)}%`, backgroundColor: scoreFillColor },
          ]}
        />
      </View>

      {/* Plain-English Reasons */}
      <View style={styles.reasonsBox}>
        <View style={styles.reasonsHeader}>
          <Sparkles size={13} color={COLORS.obsidian} />
          <Text style={styles.reasonsTitle}>Why this works</Text>
        </View>
        {reasons.map((reason, idx) => (
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  thumbnail: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: COLORS.cardMuted,
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
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1.5,
    backgroundColor: '#FAF9F6',
  },
  scoreNumber: {
    fontSize: 15,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 1,
  },
  harmonyRow: {
    marginTop: 6,
  },
  scoreBarTrack: {
    height: 5,
    borderRadius: 9999,
    backgroundColor: COLORS.cardMuted,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
  reasonsBox: {
    backgroundColor: COLORS.canvas,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reasonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.obsidian,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  reasonBullet: {
    marginTop: 3,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.charcoal,
    fontWeight: '500',
  },
});
