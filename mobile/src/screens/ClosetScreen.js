import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../components/ItemCard';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { deleteItem } from '../services/api';
import { theme } from '../styles/theme';

export default function ClosetScreen({
  closet,
  profile,
  loading = false,
  refreshing,
  onRefresh,
  onItemDeleted,
  onOpenAddItem,
  onStyleItem,
}) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteItem(id);
      onItemDeleted(id);
    } catch (err) {
      console.warn('Could not delete item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Title & Plan Status Pill */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.screenTitle}>My Wardrobe</Text>
          <Text style={styles.subTitle}>
            Tap any garment to find matching outfits
          </Text>
        </View>

        <View style={styles.planPill}>
          <Text style={styles.planPillText}>
            {profile?.isPro ? 'Pro Unlimited' : `${closet.length}/${profile?.itemLimit || 30}`}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && closet.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerArea}>
          <Skeleton width={140} height={28} style={{ marginBottom: 8 }} />
          <Skeleton width={200} height={16} />
        </View>
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <Skeleton width="100%" height={170} borderRadius={theme.radius.lg} />
              <Skeleton width="70%" height={16} style={{ marginTop: 10 }} />
              <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={closet}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={() => onStyleItem(item)}
            activeOpacity={0.88}
          >
            <ItemCard
              item={item}
              onDelete={handleDelete}
              isDeleting={deletingId === item.id}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !refreshing && (
            <EmptyState
              icon={<Ionicons name="shirt-outline" size={32} color={theme.colors.primary} />}
              title="Your Wardrobe is Empty"
              subtitle="Add your clothes using the center + button to get personalized color harmony matches."
              actionTitle="Add First Item"
              onAction={onOpenAddItem}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[12],
  },
  headerArea: {
    marginBottom: theme.spacing[4],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: theme.typography.xl.fontSize,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planPill: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  planPillText: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  columnWrapper: {
    gap: 12,
  },
  cardTouchable: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing[4],
    gap: 12,
  },
  skeletonCard: {
    width: '48%',
    marginBottom: theme.spacing[3],
  },
});
