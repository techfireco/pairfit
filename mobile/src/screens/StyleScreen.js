import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecommendationCard from '../components/RecommendationCard';
import { getRecommendations } from '../services/api';
import { CATEGORY_LABELS } from '../config';
import { theme } from '../styles/theme';

export default function StyleScreen({ closet, onSwitchToCloset }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [styledItem, setStyledItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectItem = async (item) => {
    setSelectedItemId(item.id);
    setStyledItem(item);
    setLoadingMatches(true);
    setErrorMsg('');

    try {
      const data = await getRecommendations(item.id);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setErrorMsg(err.message || 'Could not calculate recommendations');
      setRecommendations([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  if (!closet || closet.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBg}>
          <Ionicons name="sparkles-outline" size={38} color={theme.colors.accent} />
        </View>
        <Text style={styles.emptyTitle}>Your closet is empty</Text>
        <Text style={styles.emptySubtitle}>
          Add a few clothing items in different categories (tops, bottoms, jackets) to see color-theory pairing recommendations.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={onSwitchToCloset} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>Go to My Closet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Pick an item to style</Text>
        <Text style={styles.subheading}>
          Tap any garment from your closet to find what goes with it
        </Text>
      </View>

      {/* Horizontal Item Picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickerRow}
      >
        {closet.map((item) => {
          const isSelected = selectedItemId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.pickerCard, isSelected && styles.pickerCardSelected]}
              onPress={() => handleSelectItem(item)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.photoUrl }} style={styles.pickerImage} resizeMode="cover" />
              <View style={styles.pickerBody}>
                <Text style={styles.pickerName} numberOfLines={1}>
                  {item.name || 'Untitled'}
                </Text>
                <View style={styles.pickerMeta}>
                  <View style={[styles.swatchDot, { backgroundColor: item.colorHex || '#ccc' }]} />
                  <Text style={styles.pickerCategory}>
                    {CATEGORY_LABELS[item.category] || item.category}
                  </Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Matches Section */}
      <View style={styles.resultsArea}>
        {!selectedItemId && (
          <View style={styles.placeholderBox}>
            <Ionicons name="hand-left-outline" size={28} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText}>Tap an item above to calculate color harmony matches.</Text>
          </View>
        )}

        {loadingMatches && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Running color-theory engine & rules…</Text>
          </View>
        )}

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {!loadingMatches && recommendations !== null && (
          <View style={styles.matchesContainer}>
            <View style={styles.matchesHeader}>
              <Text style={styles.matchesHeading}>
                Best Matches for{' '}
                <Text style={styles.styledItemHighlight}>{styledItem?.name || 'Item'}</Text>
              </Text>
              <Text style={styles.matchesCountBadge}>
                {recommendations.length} {recommendations.length === 1 ? 'match' : 'matches'}
              </Text>
            </View>

            {recommendations.length === 0 ? (
              <View style={styles.noMatchesCard}>
                <Ionicons name="color-palette-outline" size={32} color={theme.colors.textMuted} />
                <Text style={styles.noMatchesTitle}>No matching items yet</Text>
                <Text style={styles.noMatchesText}>
                  Add more clothes in a pairing category (for example, add tops or jackets if you picked pants). Same-category items do not pair.
                </Text>
              </View>
            ) : (
              recommendations.map((rec) => (
                <RecommendationCard key={rec.item.id} recommendation={rec} />
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pickerRow: {
    gap: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  pickerCard: {
    width: 120,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
    position: 'relative',
  },
  pickerCardSelected: {
    borderColor: theme.colors.primary,
  },
  pickerImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#EEEEEE',
  },
  pickerBody: {
    padding: 8,
  },
  pickerName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  pickerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D4D4D8',
  },
  pickerCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  resultsArea: {
    marginTop: 6,
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderStyle: 'dashed',
    gap: 10,
  },
  placeholderText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingBox: {
    padding: 36,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerBg,
    padding: 12,
    borderRadius: theme.radius.md,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
    flex: 1,
  },
  matchesContainer: {
    gap: 10,
  },
  matchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchesHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
  },
  styledItemHighlight: {
    color: theme.colors.accent,
  },
  matchesCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  noMatchesCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    gap: 8,
  },
  noMatchesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  noMatchesText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
