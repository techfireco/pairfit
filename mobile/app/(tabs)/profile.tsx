import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Zap,
  Mail,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, me, signOut, deleteAccount } = useAuth();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const handleDeleteAccountPress = () => {
    // Explicit confirmed dialog before deletion
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all wardrobe items? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const res = await deleteAccount();
            setIsDeleting(false);
            if (res.error) {
              Alert.alert('Error', res.error);
            } else {
              router.replace('/welcome');
            }
          },
        },
      ]
    );
  };

  const handleSupportPress = () => {
    Linking.openURL('mailto:support@getpairfit.com?subject=PairFit%20App%20Support');
  };

  const count = me?.itemCount ?? 0;
  const limit = me?.itemLimit ?? 30;
  const isPro = me?.isPro ?? false;
  const progressRatio = isPro ? 1 : Math.min(count / limit, 1);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header (C5: Title matches tab label 'Profile') */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Card */}
        <View style={[styles.userCard, SHADOWS.card]}>
          <View style={styles.avatar}>
            <User size={30} color={COLORS.obsidian} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.user_metadata?.name || 'PairFit Member'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'user@pairfit.app'}</Text>
          </View>
        </View>

        {/* Plan Status Card (C6: Consistent wording) */}
        <View style={[styles.planCard, SHADOWS.card]}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planTitle}>{isPro ? 'PairFit Pro' : 'Free Plan'}</Text>
              <Text style={styles.planSubtitle}>
                {isPro ? 'Unlimited clothing items' : `${count} / ${limit} items (Free plan)`}
              </Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>{isPro ? 'PRO' : 'FREE'}</Text>
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
              <Zap size={16} color="#FFFFFF" />
              <Text style={styles.upgradeBtnText}>Upgrade to Unlimited Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal & Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Legal & Information</Text>
          <View style={[styles.menuGroup, SHADOWS.soft]}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/legal/terms')}
              activeOpacity={0.7}
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
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Shield size={18} color={COLORS.obsidian} />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleSupportPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Mail size={18} color={COLORS.obsidian} />
              </View>
              <Text style={styles.menuLabel}>Contact Support</Text>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Session</Text>
          <View style={[styles.menuGroup, SHADOWS.soft]}>
            <TouchableOpacity style={styles.menuRow} onPress={handleSignOut} activeOpacity={0.7}>
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
              style={styles.deleteRow}
              onPress={handleDeleteAccountPress}
              disabled={isDeleting}
              activeOpacity={0.7}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <>
                  <Trash2 size={18} color={COLORS.danger} />
                  <Text style={styles.deleteLabel}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Version footer */}
        <Text style={styles.versionText}>PairFit v1.0.0 (Build 1)</Text>

        {/* Pro Paywall Modal */}
        <PaywallModal
          visible={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
        />
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
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
    paddingRight: 48, // Generous padding so Expo Go gear button doesn't cover title
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.8,
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
    color: '#4B5563', // Darkened for accessibility
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
    color: '#4B5563',
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
    fontSize: 10.5,
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
    minHeight: 46,
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
    color: '#4B5563',
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 48, // 48dp accessible tap target
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  deleteLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
