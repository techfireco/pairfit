import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Shirt } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { Button } from './Button';

interface LimitReachedModalProps {
  visible: boolean;
  limit: number;
  onClose: () => void;
}

// Shown when the server rejects an upload with 402 (free closet is full).
// No prices or purchase buttons until real in-app purchases ship: placeholder
// paywalls get apps rejected (App Store 2.1 / 3.1.2).
export function LimitReachedModal({ visible, limit, onClose }: LimitReachedModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={20} color={COLORS.obsidian} />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Shirt size={28} color={COLORS.obsidian} />
          </View>

          <Text style={styles.headline}>Your closet is full</Text>
          <Text style={styles.subtitle}>
            Free accounts can hold up to {limit} pieces. Remove something you no longer wear to make
            room for a new piece.
          </Text>

          <Button title="Got it" onPress={onClose} size="lg" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 28,
    paddingHorizontal: 22,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.obsidian,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
});
