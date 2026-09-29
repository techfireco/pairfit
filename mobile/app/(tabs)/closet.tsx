import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Item, CATEGORIES } from '../../src/types';
import { fetchItems, deleteItemApi } from '../../src/api/client';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { ClothingCard } from '../../src/components/ClothingCard';
import { Badge } from '../../src/components/Badge';
import { AddItemModal } from '../../src/components/AddItemModal';
import { PaywallModal } from '../../src/components/PaywallModal';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Plus, Shirt } from 'lucide-react-native';

export default function ClosetScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const { me, refreshMe } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadWardrobe = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchItems();
      // Prefetch images so they are warm in expo-image disk-memory cache
      data.forEach((item) => {
        if (item.photoUrl) {
          ExpoImage.prefetch(item.photoUrl);
        }
      });

      setItems((prev) => {
        // Keep existing signed URLs during the session to guarantee 100% cache hits
        const prevUrlMap = new Map(prev.map((i) => [i.id, i.photoUrl]));
        const merged = data.map((item) => ({
          ...item,
          photoUrl: prevUrlMap.get(item.id) || item.photoUrl,
        }));

        if (
          prev.length === merged.length &&
          prev.every(
            (p, idx) =>
              p.id === merged[idx].id &&
              p.photoUrl === merged[idx].photoUrl &&
              p.name === merged[idx].name &&
              p.category === merged[idx].category &&
              p.colorHex === merged[idx].colorHex
          )
        ) {
          return prev;
        }
        return merged;
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

  const handleDeleteItem = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteItemApi(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      await refreshMe();
    } catch (err: any) {
      setError(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter items by category group
  const filteredItems = items.filter((item) => {
    if (selectedGroup === 'all') return true;
    const cat = CATEGORIES.find((c) => c.value === item.category);
    return cat ? cat.group === selectedGroup : selectedGroup === 'top';
  });

  const count = me?.itemCount ?? items.length;
  const limit = me?.itemLimit ?? 30;
  const isPro = me?.isPro ?? false;
  const planBadgeText = isPro
    ? 'Pro plan — unlimited items'
    : `${count} / ${limit} items (Free plan)`;

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'top', label: 'Tops' },
    { key: 'bottom', label: 'Bottoms' },
    { key: 'outer', label: 'Outerwear' },
    { key: 'onepiece', label: 'One-Piece' },
  ];

  const isEmpty = items.length === 0;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleColumn}>
            <Text style={styles.headerTitle}>My Closet</Text>
            <View style={styles.badgeRow}>
              <Badge label={planBadgeText} variant="plan" />
            </View>
          </View>

          {/* Hide header CTA when closet is empty so there's one clear primary action */}
          {!isEmpty && (
            <TouchableOpacity
              style={[styles.addButton, SHADOWS.button]}
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.8}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Piece</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips - marginHorizontal breaks out to screen edges so chips don't clip */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterTabs}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isSelected = selectedGroup === item.key;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                  onPress={() => setSelectedGroup(item.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* User-friendly Error Notification with Retry & Dismiss */}
        {error && (
          <ErrorBanner
            error={error}
            onRetry={loadWardrobe}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Wardrobe Grid or Empty State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.obsidian} />
            <Text style={styles.loadingText}>Opening your wardrobe…</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Shirt size={32} color={COLORS.obsidian} />
            </View>
            <Text style={styles.emptyTitle}>
              {isEmpty ? 'Your closet is empty' : 'No items in this category'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isEmpty
                ? 'Snap or upload clothing photos to see color-ranked pairings.'
                : 'Try picking another category or add a new piece to your closet.'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, SHADOWS.button]}
              onPress={() => setIsAddModalOpen(true)}
              activeOpacity={0.85}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>
                {isEmpty ? 'Add First Clothing Item' : 'Add Clothing Item'}
              </Text>
            </TouchableOpacity>
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.obsidian}
              />
            }
            renderItem={({ item }) => (
              <ClothingCard
                item={item}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/style',
                    params: { preselectId: item.id },
                  });
                }}
                onDelete={handleDeleteItem}
                isDeleting={deletingId === item.id}
              />
            )}
          />
        )}

        {/* Add Item Modal */}
        <AddItemModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={loadWardrobe}
          onUpgrade={() => {
            setIsAddModalOpen(false);
            setIsPaywallOpen(true);
          }}
        />

        {/* Paywall Modal */}
        <PaywallModal
          visible={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    paddingRight: 48, // Generous right margin so Expo Go floating gear icon never covers the header buttons
  },
  titleColumn: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.8,
  },
  badgeRow: {
    marginTop: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.obsidian,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    minHeight: 44, // 44dp tap target
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  filtersContainer: {
    marginHorizontal: -20, // Negative margin allows edge-to-edge scroll
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 20, // Content padding ensures first chip has proper left padding
    gap: 10,
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: COLORS.obsidian,
    borderColor: COLORS.obsidian,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  columnWrapper: {
    gap: 14,
  },
  gridContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 30,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.obsidian,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    minHeight: 48,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
