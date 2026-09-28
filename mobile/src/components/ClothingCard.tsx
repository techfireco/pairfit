import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Item, CATEGORY_LABELS } from '../types';
import { COLORS, SHADOWS } from '../constants/theme';
import { Badge } from './Badge';
import { ColorSwatch } from './ColorSwatch';
import { Trash2 } from 'lucide-react-native';

interface ClothingCardProps {
  item: Item;
  onPress?: () => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export function ClothingCard({ item, onPress, onDelete, isDeleting = false }: ClothingCardProps) {
  const [isArmed, setIsArmed] = useState(false);
  const armTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (armTimeoutRef.current) {
        clearTimeout(armTimeoutRef.current);
      }
    };
  }, []);

  const handleDeletePress = async () => {
    if (!isArmed) {
      setIsArmed(true);
      armTimeoutRef.current = setTimeout(() => {
        setIsArmed(false);
      }, 4000);
      return;
    }

    // Second tap: execute delete
    if (armTimeoutRef.current) {
      clearTimeout(armTimeoutRef.current);
    }
    setIsArmed(false);
    await onDelete(item.id);
  };

  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <View style={[styles.card, SHADOWS.card]}>
      <TouchableOpacity
        activeOpacity={onPress ? 0.85 : 1}
        onPress={onPress}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: item.photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadgeOverlay}>
          <Badge label={categoryLabel} variant="category" />
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name || 'Untitled Piece'}
        </Text>

        <View style={styles.metaRow}>
          <ColorSwatch hex={item.colorHex} size={14} showHex />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDeletePress}
          disabled={isDeleting}
          style={[
            styles.deleteButton,
            isArmed && styles.deleteButtonArmed,
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <>
              {!isArmed && <Trash2 size={13} color={COLORS.textSecondary} />}
              <Text
                style={[
                  styles.deleteText,
                  isArmed && styles.deleteTextArmed,
                ]}
                numberOfLines={1}
              >
                {isArmed ? 'Tap again to confirm remove' : 'Remove'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.cardMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: COLORS.cardMuted,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deleteButtonArmed: {
    backgroundColor: COLORS.dangerLight,
    borderColor: COLORS.dangerBorder,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deleteTextArmed: {
    color: COLORS.danger,
    fontSize: 11,
  },
});
