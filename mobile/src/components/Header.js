import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function Header({ user, onLogout }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.logoContainer}>
          <Ionicons name="shirt-outline" size={22} color={theme.colors.card} />
        </View>
        <View>
          <Text style={styles.title}>PairFit</Text>
          <Text style={styles.subtitle}>Outfit Color Engine</Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {user?.email && (
          <View style={styles.userBadge}>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email.split('@')[0]}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={onLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cardBorder,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userBadge: {
    backgroundColor: theme.colors.chipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    maxWidth: 110,
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    padding: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.chipBg,
  },
});
