import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../theme';

// Decorative fan of garment-colored swatches, used for empty states and the welcome hero.
const SWATCHES = [
  { color: '#2B3A55', rotate: '-12deg', offsetX: -0.34, offsetY: 0.06 },
  { color: '#E8DCC4', rotate: '3deg', offsetX: 0, offsetY: -0.04 },
  { color: '#B5563C', rotate: '15deg', offsetX: 0.32, offsetY: 0.08 },
];
const EDGE = 3;
const STAGGER_MS = 90;

export function SwatchStack({ size = 120 }: { size?: number }) {
  const { colors } = useTheme().theme;
  const tileWidth = size * 0.5;
  const tileHeight = size * 0.66;
  const width = size * 1.45;
  const height = size * 0.95;

  return (
    <View style={{ width, height }} aria-hidden>
      {SWATCHES.map((swatch, i) => (
        // The entering animation owns the outer transform; the tilt lives on the inner view.
        <Animated.View
          key={swatch.color}
          entering={FadeInDown.duration(420).delay(i * STAGGER_MS)}
          style={[
            styles.tile,
            {
              width: tileWidth,
              height: tileHeight,
              left: width / 2 - tileWidth / 2 + swatch.offsetX * size,
              top: height / 2 - tileHeight / 2 + swatch.offsetY * size,
            },
          ]}
        >
          <View style={[styles.tilt, { transform: [{ rotate: swatch.rotate }] }]}>
            <View style={[styles.edge, { backgroundColor: colors.accentEdge }]} />
            <View style={[styles.face, { backgroundColor: swatch.color, borderColor: colors.swatchBorder }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
  },
  tilt: {
    flex: 1,
  },
  edge: {
    position: 'absolute',
    top: EDGE,
    left: EDGE,
    right: -EDGE,
    bottom: -EDGE,
    borderRadius: 10,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    borderWidth: 1,
  },
});
