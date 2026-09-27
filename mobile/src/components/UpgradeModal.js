import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export default function UpgradeModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={28} color="#D97706" />
          </View>

          <Text style={styles.title}>Wardrobe Limit Reached</Text>
          <Text style={styles.description}>
            You’ve hit the 30-item limit on the Free plan. Upgrade to PairFit Pro to unlock unlimited clothing items, saved outfits, and seasonal wardrobes.
          </Text>

          <View style={styles.featuresBox}>
            <View style={styles.featureItem}>
              <Ionicons name="infinite" size={18} color={theme.colors.success} />
              <Text style={styles.featureText}>Unlimited wardrobe uploads</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="layers-outline" size={18} color={theme.colors.success} />
              <Text style={styles.featureText}>Full outfit generation & layering</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="bookmark-outline" size={18} color={theme.colors.success} />
              <Text style={styles.featureText}>Saved outfits lookbook</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresBox: {
    width: '100%',
    backgroundColor: theme.colors.chipBg,
    borderRadius: theme.radius.md,
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  closeButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
