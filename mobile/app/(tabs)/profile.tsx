import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SHADOWS } from '../../src/constants/theme';
import { PaywallModal } from '../../src/components/PaywallModal';
import {
  User,
  Shield,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, me, signOut, deleteAccount } = useAuth();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteArmed, setIsDeleteArmed] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const handleDeleteAccountPress = async () => {
    if (!isDeleteArmed) {
      setIsDeleteArmed(true);
      deleteTimeoutRef.current = setTimeout(() => {
        setIsDeleteArmed(false);
      }, 4000);
      return;
    }

    // Second tap: execute delete
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    setIsDeleteArmed(false);
    setIsDeleting(true);

    const res = await deleteAccount();
    setIsDeleting(false);

    if (res.error) {
      alert(res.error);
    } else {
      router.replace('/welcome');
    }
  };

  const count = me?.itemCount ?? 0;
  const limit = me?.itemLimit ?? 30;
  const isPro = me?.isPro ?? false;
  const progressRatio = isPro ? 1 : Math.min(count / limit, 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, SHADOWS.card]}>
          <View style={styles.avatar}>
            <User size={30} color={COLORS.obsidian} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || 'PairFit Stylist'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'user@pairfit.app'}</Text>
          </View>
        </View>

        {/* Plan Status Card */}
        <View style={[styles.planCard, SHADOWS.card]}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planTitle}>{isPro ? 'PairFit Pro' : 'Free Plan'}</Text>
              <Text style={styles.planSubtitle}>
                {isPro ? 'Unlimited clothing items' : `${count} of ${limit} items used`}
              </Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{isPro ? 'ACTIVE' : 'FREE'}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressRatio * 100}%` },
                progressRatio >= 1 && !isPro && { backgroundColor: COLORS.danger },
              ]}
            />
          </View>

          {!isPro && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.upgradeBannerBtn, SHADOWS.button]}
              onPress={() => setIsPaywallOpen(true)}
            >
              <Zap size={15} color="#FFFFFF" />
              <Text style={styles.upgradeBtnText}>Upgrade to Unlimited Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal & Compliance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Legal & Information</Text>
          <View style={[styles.menuGroup, SHADOWS.soft]}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/legal/terms')}
            >
              <View style={styles.menuIconWrap}>
                <FileText size={18} color={COLORS.obsidian} />
              </View>
              <Text style={styles.menuLabel}>Terms of Service</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/legal/privacy')}
            >
              <View style={styles.menuIconWrap}>
                <Shield size={18} color={COLORS.obsidian} />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Session</Text>
          <View style={[styles.menuGroup, SHADOWS.soft]}>
            <TouchableOpacity style={styles.menuRow} onPress={handleSignOut}>
              <View style={styles.menuIconWrap}>
                <LogOut size={18} color={COLORS.obsidian} />
              </View>
              <Text style={styles.menuLabel}>Sign Out</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Danger Zone</Text>
          <View style={[styles.menuGroup, SHADOWS.soft]}>
            <TouchableOpacity
              style={[
                styles.deleteRow,
                isDeleteArmed && styles.deleteRowArmed,
              ]}
              onPress={handleDeleteAccountPress}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <>
                  <Trash2 size={18} color={COLORS.danger} />
                  <Text
                    style={[
                      styles.deleteLabel,
                      isDeleteArmed && styles.deleteLabelArmed,
                    ]}
                  >
                    {isDeleteArmed ? 'Tap again to permanently delete account' : 'Delete Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Version footer */}
        <Text style={styles.versionText}>PairFit Mobile v1.0.0 • React Native + Expo</Text>

        {/* Pro Paywall Modal */}
        <PaywallModal
          visible={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    gap: 14,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.obsidian,
  },
  planSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.6,
  },
  progressTrack: {
    height: 8,
    borderRadius: 9999,
    backgroundColor: COLORS.cardMuted,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: COLORS.obsidian,
  },
  upgradeBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.obsidian,
    borderRadius: 9999,
    paddingVertical: 12,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: COLORS.obsidian,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 56,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  deleteRowArmed: {
    backgroundColor: COLORS.dangerLight,
  },
  deleteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },
  deleteLabelArmed: {
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
