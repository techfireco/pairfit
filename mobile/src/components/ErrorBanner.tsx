import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AlertCircle, RefreshCw, X } from 'lucide-react-native';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../theme';
import { getUserFriendlyErrorMessage } from '../utils/errors';

interface ErrorBannerProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };

export function ErrorBanner({ error, onRetry, onDismiss, style }: ErrorBannerProps) {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  if (!error) return null;

  const message = getUserFriendlyErrorMessage(error);

  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      <AlertCircle size={18} color={colors.danger} />
      <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {message}
      </Text>

      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <RefreshCw size={13} color={colors.dangerText} />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}

      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={HIT_SLOP} accessibilityRole="button" accessibilityLabel="Dismiss">
          <X size={16} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: RADIUS.md,
      paddingVertical: SPACING.sm + 2,
      paddingHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    },
    message: {
      ...TYPE.caption,
      flex: 1,
      color: colors.dangerText,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: colors.danger,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: RADIUS.pill,
    },
    retryText: {
      ...TYPE.caption,
      fontSize: 12,
      color: colors.dangerText,
    },
  });
