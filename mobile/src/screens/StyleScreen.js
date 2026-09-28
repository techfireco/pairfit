import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import ScoreBadge from '../components/ui/ScoreBadge';
import ColorChip from '../components/ui/ColorChip';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getRecommendations } from '../services/api';
import { CATEGORY_LABELS } from '../config';
import { theme } from '../styles/theme';

export default function StyleScreen({ item, onBack, onOpenAddItem }) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!item?.id) return;
    let isMounted = true;

    async function fetchMatches() {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await getRecommendations(item.id);
        if (isMounted) {
          setRecommendations(data.recommendations || []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'Could not find outfit matches');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [item?.id]);

  if (!item) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={<Ionicons name="shirt-outline" size={32} color={theme.colors.textMuted} />}
          title="No Item Selected"
          subtitle="Select any clothing piece from your wardrobe to see what goes with it."
          actionTitle="Back to Wardrobe"
          onAction={onBack}
        />
      </View>
    );
  }

  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Navigation Bar */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          <Text style={styles.backText}>Wardrobe</Text>
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>Outfit Harmony</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* SELECTED ITEM SHOWN LARGE ON TOP */}
      <Card style={styles.heroCard} elevation="md">
        <View style={styles.heroImageContainer}>
          <Image source={{ uri: item.photoUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{categoryLabel}</Text>
          </View>
        </View>

        <View style={styles.heroDetails}>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {item.name || 'Untitled Garment'}
            </Text>
            <ColorChip hex={item.colorHex} size="md" />
          </View>
          <Text style={styles.heroSub}>
            Matching clothes from your personal wardrobe:
          </Text>
        </View>
      </Card>

      {/* MATCHES SECTION */}
      <View style={styles.matchesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ranked Matches</Text>
          {!loading && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {recommendations.length} {recommendations.length === 1 ? 'match' : 'matches'}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.skeletonList}>
            {[1, 2, 3].map((k) => (
              <Card key={k} style={styles.skeletonMatchCard}>
                <Skeleton width={80} height={80} borderRadius={theme.radius.md} />
                <View style={{ flex: 1, gap: 6, marginLeft: 12 }}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                  <Skeleton width="90%" height={12} />
                </View>
              </Card>
            ))}
          </View>
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : recommendations.length === 0 ? (
          <Card style={styles.emptyMatchesCard} elevation="sm">
            <Ionicons name="color-palette-outline" size={36} color={theme.colors.textMuted} />
            <Text style={styles.noMatchesTitle}>No matching items yet</Text>
            <Text style={styles.noMatchesText}>
              Same-group garments don't pair. Add clothes in complementary categories (e.g. tops and jackets for jeans).
            </Text>
            {onOpenAddItem && (
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={onOpenAddItem}
                activeOpacity={0.8}
              >
                <Text style={styles.addMoreText}>+ Add Pairing Item</Text>
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          recommendations.map((rec) => {
            const matchItem = rec.item;
            const matchCategory = CATEGORY_LABELS[matchItem.category] || matchItem.category;
            const primaryReason = rec.reasons?.[0] || 'Complementary color pairing';

            return (
              <Card key={matchItem.id} style={styles.matchCard} elevation="sm">
                <Image
                  source={{ uri: matchItem.photoUrl }}
                  style={styles.matchImage}
                  resizeMode="cover"
                />

                <View style={styles.matchBody}>
                  <View style={styles.matchTopRow}>
                    <View style={styles.matchTitleContainer}>
                      <Text style={styles.matchName} numberOfLines={1}>
                        {matchItem.name || 'Garment'}
                      </Text>
                      <View style={styles.matchCategoryPill}>
                        <Text style={styles.matchCategoryText}>{matchCategory}</Text>
                      </View>
                    </View>

                    <ScoreBadge score={rec.score} />
                  </View>

                  <View style={styles.reasonRow}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.reasonText} numberOfLines={2}>
                      {primaryReason}
                    </Text>
                  </View>

                  {rec.reasons?.length > 1 && (
                    <Text style={styles.extraReasonText} numberOfLines={1}>
                      + {rec.reasons[1]}
                    </Text>
                  )}
                </View>
              </Card>
            );
          })
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
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[12],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  backText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  screenHeaderTitle: {
    fontSize: theme.typography.base.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },
  heroCard: {
    marginBottom: theme.spacing[5],
  },
  heroImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#ECECEC',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroDetails: {
    padding: theme.spacing[4],
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  heroSub: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  matchesSection: {
    gap: theme.spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: theme.typography.md.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  countText: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  skeletonList: {
    gap: 12,
  },
  skeletonMatchCard: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  matchCard: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    backgroundColor: '#EEEEEE',
  },
  matchBody: {
    flex: 1,
    marginLeft: 12,
  },
  matchTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  matchTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  matchName: {
    fontSize: theme.typography.sm.fontSize + 1,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  matchCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  matchCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reasonText: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  extraReasonText: {
    fontSize: theme.typography.xs.fontSize - 1,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.dangerBg,
    padding: 12,
    borderRadius: theme.radius.md,
  },
  errorText: {
    fontSize: theme.typography.xs.fontSize,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  emptyMatchesCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noMatchesTitle: {
    fontSize: theme.typography.base.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },
  noMatchesText: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  addMoreBtn: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
  },
  addMoreText: {
    color: '#FFFFFF',
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
  },
});
