import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Shirt } from 'lucide-react-native';
import { useTheme, useThemedStyles, Theme, TYPE, SPACING, MAX_FONT_SCALE } from '../theme';
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
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING.xxl) }]}>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={20} color={colors.text} />
          </Pressable>

          <View style={styles.iconWrap}>
            <Shirt size={28} color={colors.accentText} />
          </View>

          <Text style={styles.headline} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Your closet is full
          </Text>
          <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Free accounts can hold up to {limit} pieces. Remove something you no longer wear to make
            room for a new piece.
          </Text>

          <Button title="Got it" onPress={onClose} size="lg" />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      paddingTop: SPACING.xxxl,
      paddingHorizontal: SPACING.xl + 2,
    },
    closeBtn: {
      position: 'absolute',
      top: SPACING.lg,
      right: SPACING.lg,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrap: {
      alignSelf: 'center',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.lg,
    },
    headline: {
      ...TYPE.title,
      fontSize: 24,
      lineHeight: 30,
      color: colors.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    },
    subtitle: {
      ...TYPE.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SPACING.xxl,
      paddingHorizontal: SPACING.sm,
    },
  });
