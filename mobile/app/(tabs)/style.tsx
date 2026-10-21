import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Plus } from 'lucide-react-native';
import { Item, Recommendation, CATEGORY_LABELS } from '../../src/types';
import { fetchItems, fetchRecommendationsApi } from '../../src/api/client';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../../src/theme';
import { MatchCard } from '../../src/components/MatchCard';
import { ColorSwatch } from '../../src/components/ColorSwatch';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Button } from '../../src/components/Button';
import { Skeleton } from '../../src/components/Skeleton';
import { SwatchStack } from '../../src/components/SwatchStack';
import { getColorName } from '../../src/utils/colorTheory';
import { haptics } from '../../src/utils/haptics';

const SKELETON_CARDS = [0, 1];

export default function StyleThisScreen() {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
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
      setCloset((prev) => {
        const prevUrlMap = new Map(prev.map((i) => [i.id, i.photoUrl]));
        return data.map((item) => ({ ...item, photoUrl: prevUrlMap.get(item.id) || item.photoUrl }));
      });

      if (data.length > 0) {
        setSelectedItem((prevSelected) => {
          if (params.preselectId) {
            const preselected = data.find((i) => i.id === params.preselectId);
            if (preselected) return preselected;
          }
          if (prevSelected) {
            const stillExists = data.find((i) => i.id === prevSelected.id);
            if (stillExists) return stillExists;
          }
          return data[0];
        });
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
    if (selectedItem) loadRecommendations(selectedItem);
    else setRecommendations([]);
  }, [selectedItem, loadRecommendations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCloset();
  };

  const handleSelectItem = useCallback((item: Item) => {
    setSelectedItem((prev) => {
      if (prev?.id === item.id) return prev;
      haptics.selection();
      return item;
    });
  }, []);

  const renderMatchCard = useCallback(
    ({ item, index }: { item: Recommendation; index: number }) => (
      <MatchCard recommendation={item} anchorItem={selectedItem} index={index} />
    ),
    [selectedItem]
  );

  const keyExtractor = useCallback((item: Recommendation) => item.item.id, []);
  const topInset = { paddingTop: Math.max(insets.top, SPACING.lg) };

  if (isLoadingCloset) {
    return (
      <View style={[styles.screen, topInset, styles.padded]} accessibilityLabel="Loading">
        <Skeleton width="55%" height={34} style={styles.skeletonTitle} />
        <View style={styles.skeletonRow}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width={68} height={68} radius={RADIUS.lg} />
          ))}
        </View>
        <Skeleton height={140} radius={RADIUS.lg + 2} />
      </View>
    );
  }

  if (closet.length === 0) {
    return (
      <View style={[styles.screen, topInset, styles.emptyScreen]}>
        <SwatchStack size={110} />
        <Text style={styles.emptyTitle} accessibilityRole="header">
          Nothing to style yet
        </Text>
        <Text style={styles.emptyBody}>Add a few pieces to your closet and we'll pair them by color.</Text>
        <Button
          title="Go to my closet"
          onPress={() => router.push('/(tabs)/closet')}
          size="lg"
          icon={<ArrowRight size={18} color={colors.textOnAccent} />}
          iconPosition="right"
        />
      </View>
    );
  }

  const selectedCategoryLabel = selectedItem ? CATEGORY_LABELS[selectedItem.category] || selectedItem.category : '';
  const selectedColorName = selectedItem
    ? getColorName(selectedItem.h, selectedItem.s, selectedItem.l, selectedItem.colorHex)
    : '';

  const listHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.overline}>Color match</Text>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Style this
        </Text>
        <Text style={styles.subtitle}>Pick a piece to see what goes with it</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={closet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.selectorList}
        style={styles.selector}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        renderItem={({ item }) => {
          const isSelected = selectedItem?.id === item.id;
          return (
            <Pressable
              onPress={() => handleSelectItem(item)}
              accessibilityRole="button"
              accessibilityLabel={item.name || 'Piece'}
              accessibilityState={{ selected: isSelected }}
              style={styles.anchorOption}
            >
              <View
                style={[
                  styles.anchorThumb,
                  item.colorHex ? { backgroundColor: `${item.colorHex}26` } : null,
                  isSelected && styles.anchorThumbSelected,
                ]}
              >
                <Image
                  source={{ uri: item.thumbnailUrl || item.photoUrl }}
                  style={styles.fill}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={100}
                  recyclingKey={item.id}
                  accessibilityIgnoresInvertColors
                />
              </View>
              <Text style={[styles.anchorName, isSelected && styles.anchorNameSelected]} numberOfLines={1}>
                {item.name || 'Piece'}
              </Text>
            </Pressable>
          );
        }}
      />

      {selectedItem && (
        <Animated.View key={selectedItem.id} entering={FadeIn.duration(240)} style={styles.hero}>
          <View style={[styles.heroImage, selectedItem.colorHex ? { backgroundColor: `${selectedItem.colorHex}26` } : null]}>
            <Image
              source={{ uri: selectedItem.photoUrl }}
              placeholder={{ uri: selectedItem.thumbnailUrl }}
              style={styles.fill}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              recyclingKey={selectedItem.id}
              accessibilityIgnoresInvertColors
            />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroOverline}>Styling</Text>
            <Text style={styles.heroTitle} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {selectedItem.name || 'Untitled piece'}
            </Text>
            <Text style={styles.heroMeta}>{selectedCategoryLabel}</Text>
            <ColorSwatch hex={selectedItem.colorHex} size={12} label={selectedColorName} style={styles.heroSwatch} />
          </View>
        </Animated.View>
      )}

      {error && (
        <ErrorBanner
          error={error}
          onRetry={() => selectedItem && loadRecommendations(selectedItem)}
          onDismiss={() => setError(null)}
        />
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle} accessibilityRole="header">
          Best matches
        </Text>
        {recommendations.length > 0 && (
          <Text style={styles.resultsCount}>
            {recommendations.length} {recommendations.length === 1 ? 'match' : 'matches'}
          </Text>
        )}
      </View>
    </View>
  );

  const listEmpty = isLoadingRecs ? (
    <View accessibilityLabel="Finding matches">
      {SKELETON_CARDS.map((i) => (
        <Skeleton key={i} height={150} radius={RADIUS.lg + 2} style={styles.skeletonCard} />
      ))}
    </View>
  ) : !error ? (
    <View style={styles.noMatches}>
      <Text style={styles.noMatchesTitle}>No matches yet</Text>
      <Text style={styles.noMatchesBody}>
        Add pieces from another group: bottoms for a top, or a jacket to layer.
      </Text>
      <Button
        title="Add pieces"
        variant="secondary"
        size="sm"
        onPress={() => router.push('/(tabs)/closet')}
        icon={<Plus size={16} color={colors.text} />}
      />
    </View>
  ) : null;

  return (
    <View style={[styles.screen, topInset]}>
      <FlatList
        data={isLoadingRecs ? [] : recommendations}
        renderItem={renderMatchCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
        }
      />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    padded: {
      paddingHorizontal: SPACING.xl,
    },
    fill: {
      width: '100%',
      height: '100%',
    },
    listContent: {
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.xxxl,
    },
    header: {
      marginBottom: SPACING.lg,
    },
    overline: {
      ...TYPE.overline,
      color: colors.accentText,
      marginBottom: 2,
    },
    title: {
      ...TYPE.display,
      color: colors.text,
    },
    subtitle: {
      ...TYPE.body,
      color: colors.textSecondary,
      marginTop: 2,
    },
    selector: {
      marginHorizontal: -SPACING.xl,
      marginBottom: SPACING.lg,
    },
    selectorList: {
      paddingHorizontal: SPACING.xl,
      gap: SPACING.md,
    },
    anchorOption: {
      width: 72,
      alignItems: 'center',
    },
    anchorThumb: {
      width: 68,
      height: 68,
      borderRadius: RADIUS.lg,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    anchorThumbSelected: {
      borderColor: colors.accent,
    },
    anchorName: {
      ...TYPE.caption,
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 6,
    },
    anchorNameSelected: {
      color: colors.text,
    },
    hero: {
      flexDirection: 'row',
      gap: SPACING.lg,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      padding: SPACING.md,
      marginBottom: SPACING.lg,
    },
    heroImage: {
      width: 112,
      height: 112,
      borderRadius: RADIUS.md + 2,
      overflow: 'hidden',
      backgroundColor: colors.surfaceRaised,
    },
    heroInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    heroOverline: {
      ...TYPE.overline,
      color: colors.accentText,
      marginBottom: 4,
    },
    heroTitle: {
      ...TYPE.heading,
      color: colors.text,
    },
    heroMeta: {
      ...TYPE.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    heroSwatch: {
      marginTop: SPACING.sm,
    },
    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: SPACING.md,
    },
    resultsTitle: {
      ...TYPE.heading,
      color: colors.text,
    },
    resultsCount: {
      ...TYPE.caption,
      color: colors.textMuted,
    },
    skeletonTitle: {
      marginBottom: SPACING.xl,
    },
    skeletonRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.xl,
    },
    skeletonCard: {
      marginBottom: SPACING.md,
    },
    noMatches: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      padding: SPACING.xxl,
    },
    noMatchesTitle: {
      ...TYPE.subheading,
      color: colors.text,
    },
    noMatchesBody: {
      ...TYPE.caption,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.xs,
      marginBottom: SPACING.lg,
    },
    emptyScreen: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.xxxl,
    },
    emptyTitle: {
      ...TYPE.title,
      fontSize: 26,
      color: colors.text,
      textAlign: 'center',
      marginTop: SPACING.xxl,
    },
    emptyBody: {
      ...TYPE.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: SPACING.sm,
      marginBottom: SPACING.xxl,
    },
  });
