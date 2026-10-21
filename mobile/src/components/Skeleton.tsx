import React, { useEffect } from 'react';
import { StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme, RADIUS } from '../theme';

const PULSE_MS = 800;

interface SkeletonProps {
  width?: DimensionValue;
  // Omit to size from `style` (e.g. an aspectRatio tile).
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

// Pulsing placeholder shown while content loads; hidden from screen readers.
export function Skeleton({ width = '100%', height, radius = RADIUS.md, style }: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: PULSE_MS }), -1, true);
  }, [opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      aria-hidden
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.colors.skeleton }, pulse, style]}
    />
  );
}
