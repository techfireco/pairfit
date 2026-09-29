import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Item, Recommendation, CATEGORY_LABELS } from '../../src/types';
import { fetchItems, fetchRecommendationsApi } from '../../src/api/client';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { MatchCard } from '../../src/components/MatchCard';
import { Badge } from '../../src/components/Badge';
import { ColorSwatch } from '../../src/components/ColorSwatch';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Sparkles, Layers, ArrowRight, Shirt } from 'lucide-react-native';

export default function StyleThisScreen() {
  const [closet, setCloset] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingCloset, setIsLoadingCloset] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<any>(null);

  const params = useLocalSearchParams<{ preselectId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadCloset = useCallback(async () => {
    try {
      const data = await fetchItems();
      setCloset(data);

      if (data.length > 0) {
        const target = params.preselectId
          ? data.find((i) => i.id === params.preselectId) || data[0]
          : data[0];
        setSelectedItem(target);
      } else {
        setSelectedItem(null);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoadingCloset(false);
      setRefreshing(false);
    }
  }, [params.preselectId]);

  useEffect(() => {
    loadCloset();
  }, [loadCloset]);

  const loadRecommendations = useCallback(async (item: Item) => {
    setIsLoadingRecs(true);
    setError(null);
    try {
      const res = await fetchRecommendationsApi(item.id);
      setRecommendations(res.recommendations);
    } catch (err: any) {
      setError(err);
      setRecommendations([]);
    } finally {
      setIsLoadingRecs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedItem) {
      loadRecommendations(selectedItem);
    } else {
      setRecommendations([]);
    }
  }, [selectedItem, loadRecommendations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCloset();
  };

  const handleSelectItem = (item: Item) => {
    if (selectedItem?.id === item.id) return;
    setSelectedItem(item);
  };

  if (isLoadingCloset) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.obsidian} />
          <Text style={styles.loadingText}>Opening wardrobe styling…</Text>
        </View>
      </View>
    );
  }

  if (closet.length === 0) {
    return (
      <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Shirt size={36} color={COLORS.obsidian} />
          </View>
          <Text style={styles.emptyTitle}>Add clothes to style outfits</Text>
          <Text style={styles.emptySubtitle}>
            PairFit matches items across your wardrobe using color theory. Upload pieces into your closet first to see recommendations.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, SHADOWS.button]}
            onPress={() => router.push('/(tabs)/closet')}
            activeOpacity={0.85}
          >
            <Text style={styles.emptyBtnText}>Go to My Closet</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedCategoryLabel = selectedItem
    ? CATEGORY_LABELS[selectedItem.category] || selectedItem.category
    : '';

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.obsidian}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Style This</Text>
          <Text style={styles.subtitle}>Pick any item to see color-ranked matches</Text>
        </View>

        {/* Horizontal Closet Item Selector - breaks out edge-to-edge */}
        <View style={styles.selectorSection}>
          <Text style={styles.sectionLabel}>Select Anchor Piece</Text>
          <View style={styles.horizontalScrollWrap}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={closet}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.selectorList}
              renderItem={({ item }) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectItem(item)}
                    style={[
                      styles.anchorThumbCard,
                      isSelected && styles.anchorThumbCardSelected,
                    ]}
                  >
                    <Image source={{ uri: item.photoUrl }} style={styles.thumbImage} />
                    <Text style={styles.thumbName} numberOfLines={1}>
                      {item.name || 'Piece'}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedDot}>
                        <View style={styles.selectedDotInner} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>

        {/* Selected Anchor Hero Card */}
        {selectedItem && (
          <View style={[styles.heroCard, SHADOWS.card]}>
            <View style={styles.heroRow}>
              <Image source={{ uri: selectedItem.photoUrl }} style={styles.heroImage} />
              <View style={styles.heroInfo}>
                <View style={styles.heroTagRow}>
                  <View style={styles.anchorBadge}>
                    <Sparkles size={11} color="#6D28D9" />
                    <Text style={styles.anchorBadgeText}>ANCHOR PIECE</Text>
                  </View>
                </View>

                <Text style={styles.heroTitle} numberOfLines={2}>
                  {selectedItem.name || 'Untitled Piece'}
                </Text>

                <View style={styles.heroMetaRow}>
                  <Badge label={selectedCategoryLabel} variant="category" />
                  <ColorSwatch hex={selectedItem.colorHex} size={14} showHex />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Error Notification with user-friendly formatting & Retry */}
        {error && (
          <ErrorBanner
            error={error}
            onRetry={() => selectedItem && loadRecommendations(selectedItem)}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Recommendations Section */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsTitle}>Ranked Matches</Text>
            {recommendations.length > 0 && (
              <Text style={styles.resultsCount}>
                {recommendations.length} {recommendations.length === 1 ? 'pairing' : 'pairings'} found
              </Text>
            )}
          </View>

          {isLoadingRecs ? (
            <View style={styles.recsLoadingBox}>
              <ActivityIndicator size="small" color={COLORS.obsidian} />
              <Text style={styles.recsLoadingText}>Finding best matches…</Text>
            </View>
          ) : recommendations.length === 0 && !error ? (
            <View style={styles.noMatchesBox}>
              <View style={styles.noMatchesIcon}>
                <Layers size={24} color={COLORS.obsidian} />
              </View>
              <Text style={styles.noMatchesTitle}>No matching items yet</Text>
              <Text style={styles.noMatchesText}>
                Add more clothes in a pairing category (e.g. bottoms if you picked a top, or jackets to layer).
              </Text>
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={() => router.push('/(tabs)/closet')}
                activeOpacity={0.8}
              >
                <Text style={styles.addMoreBtnText}>Add More Clothes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recommendations.map((rec) => (
              <MatchCard key={rec.item.id} recommendation={rec} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  header: {
    marginBottom: 16,
    paddingRight: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#4B5563',
    marginTop: 2,
  },
  selectorSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  horizontalScrollWrap: {
    marginHorizontal: -20,
  },
  selectorList: {
    paddingHorizontal: 20,
    gap: 10,
    paddingVertical: 4,
  },
  anchorThumbCard: {
    width: 84,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    position: 'relative',
    minHeight: 104,
  },
  anchorThumbCardSelected: {
    borderColor: COLORS.obsidian,
    backgroundColor: '#FFFFFF',
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COLORS.cardMuted,
    marginBottom: 6,
  },
  thumbName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.obsidian,
    textAlign: 'center',
  },
  selectedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.obsidian,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: COLORS.cardMuted,
  },
  heroInfo: {
    flex: 1,
  },
  heroTagRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  anchorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  anchorBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.obsidian,
    lineHeight: 22,
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsSection: {
    marginTop: 4,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.obsidian,
  },
  resultsCount: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  recsLoadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recsLoadingText: {
    fontSize: 13.5,
    color: '#4B5563',
    fontWeight: '500',
  },
  noMatchesBox: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  noMatchesIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noMatchesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 6,
  },
  noMatchesText: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  addMoreBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    backgroundColor: COLORS.obsidian,
    minHeight: 42,
    justifyContent: 'center',
  },
  addMoreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.obsidian,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.obsidian,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    minHeight: 48,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
