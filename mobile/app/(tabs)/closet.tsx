import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Item, CATEGORIES } from '../../src/types';
import { fetchItems, deleteItemApi } from '../../src/api/client';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../../src/theme';
import { ClothingCard } from '../../src/components/ClothingCard';
import { AddItemModal } from '../../src/components/AddItemModal';
import { LimitReachedModal } from '../../src/components/LimitReachedModal';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Button } from '../../src/components/Button';
import { Skeleton } from '../../src/components/Skeleton';
import { SwatchStack } from '../../src/components/SwatchStack';
import { useToast } from '../../src/components/Toast';
import { haptics } from '../../src/utils/haptics';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'outer', label: 'Outerwear' },
  { key: 'onepiece', label: 'One-piece' },
];
const DEFAULT_FREE_LIMIT = 30;
const SKELETON_TILES = [0, 1, 2, 3];

export default function ClosetScreen() {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const { me, refreshMe } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWardrobe = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchItems();
      setItems((prev) => {
        // Keep existing signed URLs during the session so images stay cached.
        const prevUrlMap = new Map(prev.map((i) => [i.id, i.photoUrl]));
        const merged = data.map((item) => ({ ...item, photoUrl: prevUrlMap.get(item.id) || item.photoUrl }));
        const isUnchanged =
          prev.length === merged.length &&
          prev.every(
            (p, idx) =>
              p.id === merged[idx].id &&
              p.photoUrl === merged[idx].photoUrl &&
              p.name === merged[idx].name &&
              p.category === merged[idx].category &&
              p.colorHex === merged[idx].colorHex
          );
        return isUnchanged ? prev : merged;
      });
      await refreshMe();
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [refreshMe]);

  useEffect(() => {
    loadWardrobe();
    // Only run on initial mount to prevent refetch loops
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWardrobe();
  };

  const handleAdded = () => {
    showToast({ message: 'Added to your closet', tone: 'success' });
    loadWardrobe();
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteItemApi(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      showToast({ message: 'Removed from your closet' });
      await refreshMe();
    } catch (err: any) {
      setError(err);
    } finally {
      setDeletingId(null);
    }
  };

  const openStyle = useCallback(
    (itemId: string) => router.push({ pathname: '/(tabs)/style', params: { preselectId: itemId } }),
    [router]
  );

  const filteredItems = items.filter((item) => {
    if (selectedGroup === 'all') return true;
    const cat = CATEGORIES.find((c) => c.value === item.category);
    return cat ? cat.group === selectedGroup : selectedGroup === 'top';
  });

  const count = me?.itemCount ?? items.length;
  const limit = me?.itemLimit ?? DEFAULT_FREE_LIMIT;
  const isPro = me?.isPro ?? false;
  const isEmpty = items.length === 0;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, SPACING.lg) }]}>
      <View style={styles.header}>
        <View style={styles.titleColumn}>
          <Text style={styles.overline}>Wardrobe</Text>
          <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            My closet
          </Text>
          <View style={styles.planChip}>
            <Text style={styles.planText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {isPro ? 'Pro · unlimited pieces' : `${count} of ${limit} pieces`}
            </Text>
          </View>
        </View>
        {!isEmpty && (
          <Button
            title="Add"
            size="sm"
            onPress={() => setIsAddModalOpen(true)}
            icon={<Plus size={16} color={colors.textOnAccent} />}
            accessibilityLabel="Add a piece"
          />
        )}
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(tab) => tab.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: tab }) => {
            const isSelected = selectedGroup === tab.key;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  if (!isSelected) haptics.selection();
                  setSelectedGroup(tab.key);
                }}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>{tab.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={styles.content}>
        {error && <ErrorBanner error={error} onRetry={loadWardrobe} onDismiss={() => setError(null)} />}

        {isLoading ? (
          <View style={styles.skeletonGrid} accessibilityLabel="Loading your closet">
            {SKELETON_TILES.map((i) => (
              <View key={i} style={styles.skeletonCell}>
                <Skeleton style={styles.skeletonTile} radius={RADIUS.lg + 2} />
                <Skeleton width="70%" height={14} style={styles.skeletonLine} />
                <Skeleton width="45%" height={12} />
              </View>
            ))}
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.empty}>
            <SwatchStack size={isEmpty ? 120 : 84} />
            <Text style={styles.emptyTitle} accessibilityRole="header">
              {isEmpty ? 'Start your closet' : 'Nothing here yet'}
            </Text>
            <Text style={styles.emptyBody}>
              {isEmpty
                ? "Add a few tops and bottoms and we'll show you what goes together."
                : 'Add a piece in this category, or pick another one.'}
            </Text>
            <Button
              title={isEmpty ? 'Add your first piece' : 'Add a piece'}
              onPress={() => setIsAddModalOpen(true)}
              size="lg"
              icon={<Plus size={18} color={colors.textOnAccent} />}
            />
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />
            }
            renderItem={({ item, index }) => (
              <ClothingCard
                item={item}
                index={index}
                onPress={() => openStyle(item.id)}
                onDelete={handleDeleteItem}
                isDeleting={deletingId === item.id}
              />
            )}
          />
        )}
      </View>

      <AddItemModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAdded}
        onLimitReached={() => {
          setIsAddModalOpen(false);
          setIsLimitModalOpen(true);
        }}
      />
      <LimitReachedModal visible={isLimitModalOpen} limit={limit} onClose={() => setIsLimitModalOpen(false)} />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.lg,
    },
    titleColumn: {
      flex: 1,
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
    planChip: {
      alignSelf: 'flex-start',
      marginTop: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      backgroundColor: colors.accentSoft,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md - 2,
      paddingVertical: 3,
    },
    planText: {
      ...TYPE.caption,
      fontSize: 12,
      lineHeight: 16,
      color: colors.accentText,
    },
    filters: {
      marginBottom: SPACING.lg,
    },
    filterList: {
      paddingHorizontal: SPACING.xl,
      gap: SPACING.sm,
    },
    filterChip: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      minHeight: 38,
      justifyContent: 'center',
      borderRadius: RADIUS.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipSelected: {
      backgroundColor: colors.chipSelected,
      borderColor: colors.chipSelected,
    },
    filterText: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },
    filterTextSelected: {
      color: colors.chipSelectedText,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.xl,
    },
    columnWrapper: {
      gap: SPACING.md + 2,
    },
    gridContent: {
      paddingBottom: SPACING.xxl,
    },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: SPACING.lg,
    },
    skeletonCell: {
      width: '47.5%',
    },
    skeletonTile: {
      aspectRatio: 1,
      marginBottom: SPACING.sm + 2,
    },
    skeletonLine: {
      marginBottom: SPACING.sm,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xxxl * 2,
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
