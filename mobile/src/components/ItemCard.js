import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_LABELS } from '../config';
import { theme } from '../styles/theme';

export default function ItemCard({ item, onDelete, isDeleting }) {
  const [armed, setArmed] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleDeletePress = () => {
    if (!armed) {
      setArmed(true);
      timerRef.current = setTimeout(() => {
        setArmed(false);
      }, 4000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setArmed(false);
      onDelete(item.id);
    }
  };

  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
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
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || 'Untitled'}
        </Text>

        <View style={styles.colorRow}>
          <View style={[styles.swatch, { backgroundColor: item.colorHex || '#ccc' }]} />
          <Text style={styles.colorHex}>{item.colorHex || 'N/A'}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            armed && styles.deleteButtonArmed,
          ]}
          onPress={handleDeletePress}
          disabled={isDeleting}
          activeOpacity={0.8}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={armed ? 'alert-circle' : 'trash-outline'}
                size={14}
                color={armed ? '#FFFFFF' : theme.colors.danger}
              />
              <Text style={[styles.deleteText, armed && styles.deleteTextArmed]}>
                {armed ? 'Tap again to remove' : 'Remove'}
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    ...theme.shadows.sm,
    marginBottom: 14,
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 180,
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
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  body: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D4D4D8',
  },
  colorHex: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.dangerBg,
  },
  deleteButtonArmed: {
    backgroundColor: theme.colors.dangerArm,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.danger,
  },
  deleteTextArmed: {
    color: '#FFFFFF',
  },
});
