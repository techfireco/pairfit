import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { theme } from '../styles/theme';

export default function ProfileScreen({ user, profile, closet, onLogout }) {
  const itemCount = profile?.itemCount ?? closet.length;
  const itemLimit = profile?.itemLimit || 30;
  const isPro = Boolean(profile?.isPro);
  const usagePercent = isPro ? 100 : Math.min(100, Math.round((itemCount / itemLimit) * 100));

  // Compute category group counts
  const categoryCounts = closet.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>My Profile</Text>

      {/* Account Info Card */}
      <Card style={styles.accountCard} elevation="sm">
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {(user?.email?.[0] || 'U').toUpperCase()}
          </Text>
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'PairFit User'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email || ''}
          </Text>
        </View>
      </Card>

      {/* Wardrobe Plan & Storage Card */}
      <Card style={styles.planCard} elevation="sm">
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planLabel}>CURRENT PLAN</Text>
            <Text style={styles.planName}>{isPro ? 'PairFit Pro' : 'Free Tier'}</Text>
          </View>
          <View style={[styles.planBadge, isPro ? styles.badgePro : styles.badgeFree]}>
            <Text style={[styles.badgeText, isPro ? styles.badgeTextPro : styles.badgeTextFree]}>
              {isPro ? 'UNLIMITED' : `${itemCount}/${itemLimit}`}
            </Text>
          </View>
        </View>

        {!isPro && (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${usagePercent}%` },
                  itemCount >= itemLimit && styles.progressFillFull,
                ]}
              />
            </View>
            <Text style={styles.progressCaption}>
              {itemLimit - itemCount > 0
                ? `${itemLimit - itemCount} wardrobe slots remaining on your Free plan.`
                : '30 of 30 slots used. Upgrade coming soon.'}
            </Text>
          </>
        )}
      </Card>

      {/* Wardrobe Stats Card */}
      <Card style={styles.statsCard} elevation="sm">
        <Text style={styles.cardSectionTitle}>Wardrobe Breakdown</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{closet.length}</Text>
            <Text style={styles.statLabel}>Total Clothes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {Object.keys(categoryCounts).length}
            </Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {isPro ? 'Pro' : 'Free'}
            </Text>
            <Text style={styles.statLabel}>Account</Text>
          </View>
        </View>
      </Card>

      {/* App Info & About */}
      <Card style={styles.aboutCard} elevation="sm">
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0 (Expo v1)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Engine</Text>
          <Text style={styles.infoValue}>Color-Theory Scoring (0-99)</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Photo Storage</Text>
          <Text style={styles.infoValue}>Private Cloud (Signed 7-Day)</Text>
        </View>
      </Card>

      {/* Logout Action */}
      <Button
        title="Log Out"
        variant="outline"
        icon={<Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />}
        onPress={onLogout}
        textStyle={{ color: theme.colors.danger }}
        style={styles.logoutBtn}
      />
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
    gap: theme.spacing[4],
  },
  screenTitle: {
    fontSize: theme.typography.xl.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  accountCard: {
    padding: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accountDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.md.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
  },
  userEmail: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planCard: {
    padding: theme.spacing[4],
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  planLabel: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 2,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeFree: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  badgePro: {
    backgroundColor: '#ECFDF5',
  },
  badgeText: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '800',
  },
  badgeTextFree: {
    color: theme.colors.textSecondary,
  },
  badgeTextPro: {
    color: theme.colors.success,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressFillFull: {
    backgroundColor: theme.colors.danger,
  },
  progressCaption: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statsCard: {
    padding: theme.spacing[4],
  },
  cardSectionTitle: {
    fontSize: theme.typography.base.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSubtle,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.xl.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  aboutCard: {
    padding: theme.spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
  },
  infoLabel: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.cardBorder,
  },
  logoutBtn: {
    borderColor: '#FECACA',
    marginTop: theme.spacing[2],
  },
});
