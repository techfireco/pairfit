import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import { Recommendation, Item, CATEGORY_LABELS } from '../types';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../theme';
import { ScoreRing } from './ScoreRing';
import { analyzePairing, getColorName } from '../utils/colorTheory';

interface MatchCardProps {
  recommendation: Recommendation;
  anchorItem?: Item | null;
  index?: number;
}

const STAGGER_MS = 50;
const MAX_STAGGERED = 6;

function MatchCardComponent({ recommendation, anchorItem, index = 0 }: MatchCardProps) {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const { item, score: rawScore, reasons: rawReasons } = recommendation;
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  // Differentiated analysis that names the actual garments' colors.
  const analysis = anchorItem ? analyzePairing(anchorItem, item, rawScore, rawReasons) : null;
  const displayScore = analysis ? analysis.score : rawScore;
  const displayBadge = analysis ? analysis.badge : 'Color match';
  const displayReasons = analysis ? analysis.reasons : rawReasons;
  const colorName = getColorName(item.h, item.s, item.l, item.colorHex);

  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={[styles.thumb, item.colorHex ? { backgroundColor: `${item.colorHex}26` } : null]}>
          <Image
            source={{ uri: item.thumbnailUrl || item.photoUrl }}
            style={styles.thumbImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={100}
            recyclingKey={item.id}
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.harmony} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {displayBadge}
          </Text>
          <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {item.name || 'Matching piece'}
          </Text>
          <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {categoryLabel} · {colorName}
          </Text>
        </View>

        <ScoreRing score={displayScore} size={54} />
      </View>

      <View style={styles.divider} />

      <View style={styles.reasons} accessibilityLabel={`Why this works: ${displayReasons.join('. ')}`}>
        {displayReasons.map((reason, idx) => (
          <View key={idx} style={styles.reasonRow}>
            <Check size={14} color={colors.accentText} style={styles.reasonIcon} />
            <Text style={styles.reasonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {reason}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
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

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.md + 2,
      marginBottom: SPACING.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
    },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: RADIUS.md + 2,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    info: {
      flex: 1,
      gap: 2,
    },
    harmony: {
      ...TYPE.overline,
      color: colors.accentText,
    },
    title: {
      ...TYPE.subheading,
      color: colors.text,
    },
    meta: {
      ...TYPE.caption,
      color: colors.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: SPACING.md,
    },
    reasons: {
      gap: SPACING.sm,
    },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: SPACING.sm,
    },
    reasonIcon: {
      marginTop: 3,
    },
    reasonText: {
      ...TYPE.body,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      flex: 1,
    },
  });
