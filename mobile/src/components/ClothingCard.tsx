import React, { useState, useEffect, useRef, memo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import { Item, CATEGORY_LABELS } from '../types';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../theme';
import { ColorSwatch } from './ColorSwatch';
import { getColorName } from '../utils/colorTheory';
import { haptics } from '../utils/haptics';

interface ClothingCardProps {
  item: Item;
  index?: number;
  onPress?: () => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

const DELETE_ARM_MS = 4000;
// Controls drawn over the photo sit on a dark scrim in both themes.
const ON_PHOTO = '#F4F1EA';
const STAGGER_MS = 40;
const MAX_STAGGERED = 8;

function ClothingCardComponent({ item, index = 0, onPress, onDelete, isDeleting = false }: ClothingCardProps) {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const [isArmed, setIsArmed] = useState(false);
  const armTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
    };
  }, []);

  // Two-tap delete: the first tap arms the button (auto-disarms after 4s).
  const handleDeletePress = async () => {
    if (!isArmed) {
      haptics.warning();
      setIsArmed(true);
      armTimeoutRef.current = setTimeout(() => setIsArmed(false), DELETE_ARM_MS);
      return;
    }
    if (armTimeoutRef.current) clearTimeout(armTimeoutRef.current);
    setIsArmed(false);
    await onDelete(item.id);
  };

  const name = item.name || 'Untitled piece';
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const colorName = getColorName(item.h, item.s, item.l, item.colorHex);

  return (
    <Animated.View
      entering={FadeInDown.duration(320).delay(Math.min(index, MAX_STAGGERED) * STAGGER_MS)}
      style={styles.card}
    >
      {/* Photo and remove button are siblings: nested buttons confuse screen readers. */}
      <View style={styles.tileWrap}>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          accessibilityRole="button"
          accessibilityLabel={`Style ${name}`}
          accessibilityHint="Shows the pieces that go with it"
          style={({ pressed }) => [
            styles.tile,
            item.colorHex ? { backgroundColor: `${item.colorHex}26` } : null,
            pressed && styles.tilePressed,
          ]}
        >
          <Image
            source={{ uri: item.thumbnailUrl || item.photoUrl }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            recyclingKey={item.id}
            accessibilityIgnoresInvertColors
          />
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {categoryLabel}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={handleDeletePress}
          disabled={isDeleting}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isArmed ? `Confirm removing ${name}` : `Remove ${name}`}
          style={[styles.deleteButton, isArmed && styles.deleteButtonArmed]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={ON_PHOTO} />
          ) : isArmed ? (
            <Text style={styles.confirmText}>Confirm</Text>
          ) : (
            <Trash2 size={15} color={ON_PHOTO} />
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {name}
        </Text>
        <ColorSwatch hex={item.colorHex} size={10} label={colorName} style={styles.swatch} />
      </View>
    </Animated.View>
  );
}

export const ClothingCard = memo(ClothingCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.photoUrl === next.item.photoUrl &&
    prev.item.name === next.item.name &&
    prev.item.category === next.item.category &&
    prev.item.colorHex === next.item.colorHex &&
    prev.isDeleting === next.isDeleting &&
    prev.onPress === next.onPress
  );
});

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: SPACING.md + 2,
    },
    tileWrap: {
      width: '100%',
      aspectRatio: 1,
    },
    tile: {
      flex: 1,
      backgroundColor: colors.surfaceRaised,
    },
    tilePressed: {
      opacity: 0.85,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    categoryPill: {
      position: 'absolute',
      left: SPACING.sm,
      bottom: SPACING.sm,
      backgroundColor: colors.overlay,
      borderRadius: RADIUS.pill,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    categoryText: {
      ...TYPE.caption,
      fontSize: 11,
      lineHeight: 14,
      color: ON_PHOTO,
    },
    body: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm + 2,
      paddingBottom: SPACING.md,
    },
    title: {
      ...TYPE.subheading,
      fontSize: 15,
      color: colors.text,
    },
    swatch: {
      marginTop: 6,
    },
    deleteButton: {
      position: 'absolute',
      top: SPACING.sm,
      right: SPACING.sm,
      minWidth: 32,
      height: 32,
      borderRadius: RADIUS.pill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      backgroundColor: colors.overlay,
    },
    deleteButtonArmed: {
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
      paddingHorizontal: 10,
    },
    confirmText: {
      ...TYPE.caption,
      fontSize: 12,
      color: colors.dangerText,
    },
  });
