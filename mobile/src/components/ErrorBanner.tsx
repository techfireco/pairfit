import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { getUserFriendlyErrorMessage } from '../utils/errors';

interface ErrorBannerProps {
  error: any;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: object;
}

export function ErrorBanner({ error, onRetry, onDismiss, style }: ErrorBannerProps) {
  if (!error) return null;

  const message = getUserFriendlyErrorMessage(error);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <AlertCircle size={18} color={COLORS.danger} />
      </View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetry}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <RefreshCw size={13} color={COLORS.danger} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={15} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 10,
  },
  iconWrap: {
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9999,
  },
  retryText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.danger,
  },
  dismissButton: {
    padding: 3,
  },
});
