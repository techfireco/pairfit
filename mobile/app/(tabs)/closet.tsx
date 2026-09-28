import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Item, CATEGORIES } from '../../src/types';
import { fetchItems, deleteItemApi } from '../../src/api/client';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { ClothingCard } from '../../src/components/ClothingCard';
import { Badge } from '../../src/components/Badge';
import { AddItemModal } from '../../src/components/AddItemModal';
import { PaywallModal } from '../../src/components/PaywallModal';
import { Plus, Sparkles, AlertCircle } from 'lucide-react-native';

export default function ClosetScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { me, refreshMe } = useAuth();
  const router = useRouter();

  const loadWardrobe = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchItems();
      setItems(data);
      await refreshMe();
    } catch (err: any) {
      setError(err.message || 'Could not load your closet.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [refreshMe]);

  useEffect(() => {
    loadWardrobe();
  }, [loadWardrobe]);

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
      alert(err.message || 'Failed to remove piece.');
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

  const planBadgeText = me?.isPro
    ? 'Pro plan — unlimited items'
    : `${me?.itemCount ?? items.length} / ${me?.itemLimit ?? 30} items (Free plan)`;

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'top', label: 'Tops' },
    { key: 'bottom', label: 'Bottoms' },
    { key: 'outer', label: 'Outerwear' },
    { key: 'onepiece', label: 'One-Piece' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Closet</Text>
            <View style={styles.badgeRow}>
              <Badge label={planBadgeText} variant="plan" />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addButton, SHADOWS.button]}
            onPress={() => setIsAddModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Piece</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
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

        {/* Error Notification */}
        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Wardrobe Grid */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.obsidian} />
            <Text style={styles.loadingText}>Opening your wardrobe…</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Sparkles size={32} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {items.length === 0 ? 'Your closet is empty' : 'No items in this category'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {items.length === 0
                ? 'Snap or upload clothing photos to see color-ranked pairings.'
                : 'Try picking another category or add a new piece above.'}
            </Text>
            {items.length === 0 && (
              <TouchableOpacity
                style={[styles.emptyAddBtn, SHADOWS.button]}
                onPress={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyAddBtnText}>Add First Clothing Item</Text>
              </TouchableOpacity>
            )}
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
                  // Direct to Style This tab with this item preselected
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.5,
  },
  badgeRow: {
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.obsidian,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterList: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 9999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipSelected: {
    backgroundColor: COLORS.obsidian,
    borderColor: COLORS.obsidian,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
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
    marginTop: 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.obsidian,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.obsidian,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
