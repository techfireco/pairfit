import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme, Theme, TYPE } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const FILL_DURATION_MS = 700;
const HIGH_SCORE = 88;
const MID_SCORE = 70;

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function scoreTone({ colors }: Theme, score: number): string {
  if (score >= HIGH_SCORE) return colors.scoreHigh;
  if (score >= MID_SCORE) return colors.scoreMid;
  return colors.scoreLow;
}

// Match score as a ring that fills on mount; Reanimated skips the motion
// automatically when the system "reduce motion" setting is on.
export function ScoreRing({ score, size = 56, strokeWidth = 4 }: ScoreRingProps) {
  const { theme } = useTheme();
  const value = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const color = scoreTone(theme, value);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(value / 100, {
      duration: FILL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, value]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Match score ${value} out of 100`}
    >
      {/* A wrapper turned -90° starts the ring at 12 o'clock (on web, Svg turns style transforms
          into DOM attributes); the number sits outside it so it stays upright. */}
      <View style={styles.ring}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke={theme.colors.border} strokeWidth={strokeWidth} fill="none" />
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={ringProps}
          />
        </Svg>
      </View>
      <View style={styles.center}>
        <Text style={[TYPE.score, { color, fontSize: Math.round(size * 0.34) }]} maxFontSizeMultiplier={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
