import React from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme, useThemedStyles, Theme, TYPE, POP_DEPTH, MAX_FONT_SCALE } from '../theme';
import { haptics } from '../utils/haptics';

type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  // Forward-moving actions ("Get started →") read better with the icon after the label.
  iconPosition?: 'left' | 'right';
  accessibilityLabel?: string;
}

const PRESS_IN_MS = 70;
const PRESS_OUT_MS = 140;
const SIZE_STYLES = {
  sm: { paddingVertical: 9, paddingHorizontal: 14, fontSize: 14 },
  md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 16 },
  lg: { paddingVertical: 17, paddingHorizontal: 28, fontSize: 17 },
} as const;

// Primary buttons are NeoPOP-style 3D blocks: a gold face sitting on a darker
// edge that it sinks into when pressed. Other variants are flat and scale down.
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  accessibilityLabel,
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const pressed = useSharedValue(0);

  const isPop = variant === 'primary';
  const depth = isPop ? POP_DEPTH[size] : 0;
  const isInactive = disabled || loading;
  const { fontSize, ...padding } = SIZE_STYLES[size];
  const labelColor = labelColorFor(theme, variant);

  const faceAnimation = useAnimatedStyle(() =>
    isPop
      ? { transform: [{ translateX: pressed.value * depth }, { translateY: pressed.value * depth }] }
      : { transform: [{ scale: 1 - pressed.value * 0.03 }] }
  );

  const handlePress = () => {
    if (isPop) haptics.press();
    else haptics.tap();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: PRESS_IN_MS });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: PRESS_OUT_MS });
      }}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={[{ paddingRight: depth, paddingBottom: depth }, isInactive && styles.inactive, style]}
    >
      {isPop && <View style={[styles.edge, { top: depth, left: depth }]} />}
      <Animated.View style={[styles.face, styles[variant], padding, faceAnimation]}>
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          <>
            {iconPosition === 'left' && icon}
            <Text
              style={[
                styles.label,
                { fontSize, color: labelColor },
                icon ? (iconPosition === 'left' ? styles.labelAfterIcon : styles.labelBeforeIcon) : null,
                textStyle,
              ]}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
              numberOfLines={1}
            >
              {title}
            </Text>
            {iconPosition === 'right' && icon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

function labelColorFor(theme: Theme, variant: ButtonVariant): string {
  const { colors } = theme;
  switch (variant) {
    case 'primary':
      return colors.textOnAccent;
    case 'danger':
      return colors.dangerText;
    default:
      return colors.text;
  }
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    edge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: colors.accentEdge,
    },
    face: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    danger: {
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    inactive: {
      opacity: 0.45,
    },
    label: {
      ...TYPE.button,
      textAlign: 'center',
    },
    labelAfterIcon: {
      marginLeft: 8,
    },
    labelBeforeIcon: {
      marginRight: 8,
    },
  });
