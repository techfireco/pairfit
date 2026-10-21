import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, FileText, LogOut, Trash2, ChevronRight, Mail, Moon, Sun, Smartphone } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import {
  useTheme,
  useThemedStyles,
  Theme,
  ThemePreference,
  TYPE,
  RADIUS,
  SPACING,
  MAX_FONT_SCALE,
} from '../../src/theme';
import { haptics } from '../../src/utils/haptics';

const DEFAULT_FREE_LIMIT = 30;
const SUPPORT_URL = 'mailto:support@getpairfit.com?subject=PairFit%20App%20Support';
const APPEARANCE_OPTIONS: { value: ThemePreference; label: string; Icon: typeof Moon }[] = [
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'system', label: 'System', Icon: Smartphone },
];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? 'P').concat(parts[1]?.[0] ?? '').toUpperCase();
}

export default function ProfileScreen() {
  const { user, me, signOut, deleteAccount } = useAuth();
  const { theme, preference, setPreference } = useTheme();
  const { colors } = theme;
  const styles = useThemedStyles(makeStyles);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const handleDeleteAccountPress = () => {
    haptics.warning();
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and every piece in your closet. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
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

  const displayName = user?.user_metadata?.name || 'PairFit member';
  const count = me?.itemCount ?? 0;
  const limit = me?.itemLimit ?? DEFAULT_FREE_LIMIT;
  const isPro = me?.isPro ?? false;
  const progressRatio = isPro ? 1 : Math.min(count / limit, 1);
  const isFull = !isPro && progressRatio >= 1;

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, SPACING.lg) }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Profile
        </Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText} maxFontSizeMultiplier={1.2}>
              {initialsOf(displayName)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || ''}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planTitle}>{isPro ? 'PairFit Pro' : 'Free plan'}</Text>
              <Text style={styles.planSubtitle}>{isPro ? 'Unlimited pieces' : `${count} of ${limit} pieces`}</Text>
            </View>
            <Text style={styles.planBadge}>{isPro ? 'Pro' : 'Free'}</Text>
          </View>
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityLabel="Closet space used"
            accessibilityValue={{ min: 0, max: limit, now: Math.min(count, limit) }}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progressRatio * 100}%` },
                isFull && { backgroundColor: colors.danger },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.segmented} accessibilityRole="radiogroup">
          {APPEARANCE_OPTIONS.map(({ value, label, Icon }) => {
            const isSelected = preference === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  if (!isSelected) haptics.selection();
                  setPreference(value);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${label} appearance`}
                style={[styles.segment, isSelected && styles.segmentSelected]}
              >
                <Icon size={16} color={isSelected ? colors.textOnAccent : colors.textSecondary} />
                <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            label="Terms of Service"
            icon={<FileText size={18} color={colors.textSecondary} />}
            onPress={() => router.push('/legal/terms')}
            styles={styles}
            chevronColor={colors.textMuted}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            label="Privacy Policy"
            icon={<Shield size={18} color={colors.textSecondary} />}
            onPress={() => router.push('/legal/privacy')}
            styles={styles}
            chevronColor={colors.textMuted}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            label="Contact support"
            icon={<Mail size={18} color={colors.textSecondary} />}
            onPress={() => Linking.openURL(SUPPORT_URL)}
            styles={styles}
            chevronColor={colors.textMuted}
          />
        </View>

        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.menuGroup}>
          <MenuRow
            label="Sign out"
            icon={<LogOut size={18} color={colors.textSecondary} />}
            onPress={handleSignOut}
            styles={styles}
            chevronColor={colors.textMuted}
          />
          <View style={styles.menuDivider} />
          <Pressable
            style={styles.menuRow}
            onPress={handleDeleteAccountPress}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Trash2 size={18} color={colors.danger} />
                <Text style={styles.deleteLabel}>Delete account</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.versionText}>PairFit 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function MenuRow({
  label,
  icon,
  onPress,
  styles,
  chevronColor,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  chevronColor: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {icon}
      <Text style={styles.menuLabel}>{label}</Text>
      <ChevronRight size={18} color={chevronColor} />
    </Pressable>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    container: {
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.xxxl,
    },
    title: {
      ...TYPE.display,
      color: colors.text,
      marginBottom: SPACING.xl,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.lg,
      marginBottom: SPACING.lg,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...TYPE.heading,
      color: colors.accentText,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      ...TYPE.heading,
      color: colors.text,
    },
    userEmail: {
      ...TYPE.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.lg,
      marginBottom: SPACING.xxl,
    },
    planHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.md + 2,
    },
    planTitle: {
      ...TYPE.subheading,
      color: colors.text,
    },
    planSubtitle: {
      ...TYPE.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    planBadge: {
      ...TYPE.overline,
      color: colors.accentText,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 3,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.surfaceSunken,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    sectionHeader: {
      ...TYPE.overline,
      color: colors.textMuted,
      marginBottom: SPACING.sm,
      paddingLeft: SPACING.xs,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.xs,
      gap: SPACING.xs,
      marginBottom: SPACING.xxl,
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 40,
      borderRadius: RADIUS.sm,
    },
    segmentSelected: {
      backgroundColor: colors.accent,
    },
    segmentText: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },
    segmentTextSelected: {
      color: colors.textOnAccent,
    },
    menuGroup: {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg + 2,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      marginBottom: SPACING.xxl,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md + 2,
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.lg,
      minHeight: 54,
    },
    menuRowPressed: {
      backgroundColor: colors.surfaceRaised,
    },
    menuLabel: {
      ...TYPE.bodyStrong,
      flex: 1,
      color: colors.text,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: SPACING.lg + 18 + SPACING.md + 2,
    },
    deleteLabel: {
      ...TYPE.bodyStrong,
      color: colors.dangerText,
    },
    versionText: {
      ...TYPE.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
