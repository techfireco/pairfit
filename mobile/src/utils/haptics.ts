import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const HAS_HAPTICS = Platform.OS === 'ios' || Platform.OS === 'android';

// Haptics are a nicety: a device without a vibration motor must never break a tap.
function run(effect: () => Promise<void>) {
  if (!HAS_HAPTICS) return;
  effect().catch((err) => {
    if (__DEV__) console.warn('Haptic feedback failed:', err);
  });
}

export const haptics = {
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  selection: () => run(() => Haptics.selectionAsync()),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
