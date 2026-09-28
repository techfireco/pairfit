import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from './ui/BottomSheet';
import Button from './ui/Button';
import { theme } from '../styles/theme';

export default function PaywallSheet({ visible, onClose }) {
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const handleJoinWaitlist = () => {
    setWaitlistJoined(true);
    setTimeout(() => {
      onClose();
      setWaitlistJoined(false);
    }, 1800);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Wardrobe Limit">
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.limitPill}>
            <Text style={styles.limitPillText}>30 / 30 items used</Text>
          </View>
        </View>

        <Text style={styles.headline}>Free Plan Limit Reached</Text>
        <Text style={styles.description}>
          You've used all 30 wardrobe slots on the Free plan. PairFit Pro with unlimited items, saved outfits, and multi-piece generators is coming soon!
        </Text>

        <View style={styles.perksCard}>
          <View style={styles.perkRow}>
            <Ionicons name="infinite" size={18} color={theme.colors.success} />
            <Text style={styles.perkText}>Unlimited wardrobe uploads</Text>
          </View>
          <View style={styles.perkRow}>
            <Ionicons name="layers-outline" size={18} color={theme.colors.success} />
            <Text style={styles.perkText}>Full outfit generation (top + bottom + layer)</Text>
          </View>
          <View style={styles.perkRow}>
            <Ionicons name="bookmark-outline" size={18} color={theme.colors.success} />
            <Text style={styles.perkText}>Saved outfits lookbook & occasion filters</Text>
          </View>
        </View>

        <Button
          title={waitlistJoined ? 'You’re on the waitlist! 🎉' : 'Join Pro Waitlist (Coming Soon)'}
          onPress={handleJoinWaitlist}
          disabled={waitlistJoined}
          size="lg"
          style={styles.actionBtn}
        />

        <Button
          title="Dismiss"
          variant="ghost"
          size="sm"
          onPress={onClose}
          style={styles.dismissBtn}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  badgeRow: {
    marginBottom: theme.spacing[2],
  },
  limitPill: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  limitPillText: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  description: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing[4],
  },
  perksCard: {
    width: '100%',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing[3],
    gap: 10,
    marginBottom: theme.spacing[5],
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  actionBtn: {
    width: '100%',
    marginBottom: theme.spacing[2],
  },
  dismissBtn: {
    width: '100%',
  },
});
