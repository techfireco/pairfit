import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemedStyles, Theme, TYPE, MAX_FONT_SCALE } from '../theme';

interface ColorSwatchProps {
  hex: string;
  size?: number;
  // Text shown next to the dot, e.g. a color name. Falls back to the hex when `showHex`.
  label?: string;
  showHex?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ColorSwatch({ hex, size = 16, label, showHex = false, style }: ColorSwatchProps) {
  const styles = useThemedStyles(makeStyles);
  const safeHex = hex || '#888888';
  const text = label ?? (showHex ? safeHex.toUpperCase() : null);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: safeHex }]}
      />
      {text ? (
        <Text style={styles.label} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 1,
    },
    dot: {
      borderWidth: 1,
      borderColor: colors.swatchBorder,
    },
    label: {
      ...TYPE.caption,
      color: colors.textSecondary,
      flexShrink: 1,
    },
  });
