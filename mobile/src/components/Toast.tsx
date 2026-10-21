import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, AlertCircle, Info } from 'lucide-react-native';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../theme';

type ToastTone = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  tone?: ToastTone;
}

interface ActiveToast {
  id: number;
  message: string;
  tone: ToastTone;
}

const TOAST_DURATION_MS = 2600;

const ToastContext = createContext<{ showToast: (options: ToastOptions) => void } | undefined>(undefined);

// One toast at a time, pinned under the status bar; replaces Alert popups for
// quick confirmations like "Added to your closet".
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback(({ message, tone = 'info' }: ToastOptions) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
    AccessibilityInfo.announceForAccessibility(message);
    hideTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const value = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <ToastView key={toast.id} toast={toast} />}
    </ToastContext.Provider>
  );
}

function ToastView({ toast }: { toast: ActiveToast }) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { colors } = theme;
  const iconColor = toast.tone === 'error' ? colors.danger : toast.tone === 'success' ? colors.accentText : colors.text;
  const Icon = toast.tone === 'error' ? AlertCircle : toast.tone === 'success' ? Check : Info;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + SPACING.sm }]}>
      <Animated.View
        entering={FadeInUp.duration(220)}
        exiting={FadeOutUp.duration(180)}
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.toast}
      >
        <Icon size={18} color={iconColor} />
        <Text style={styles.message} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    host: {
      position: 'absolute',
      left: SPACING.lg,
      right: SPACING.lg,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      maxWidth: 480,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: RADIUS.pill,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
    },
    message: {
      ...TYPE.caption,
      color: colors.text,
      flexShrink: 1,
    },
  });
