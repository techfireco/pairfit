import React from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../theme';

// Same geometry as the app icon (two paired swatch chips on 3D edges), in theme colors.
const CHIP_W = 22;
const CHIP_H = 50;
const GAP = 6;
const LIFT = 8;
const DEPTH = 2.6;
const CORNER = 1.5;
const VIEW_W = CHIP_W * 2 + GAP + DEPTH;
const VIEW_H = CHIP_H + LIFT + DEPTH;

export function Logo({ size = 40 }: { size?: number }) {
  const { colors } = useTheme().theme;
  const chip = (x: number, y: number, fill: string, key: string) => (
    <React.Fragment key={key}>
      <Rect x={x + DEPTH} y={y + DEPTH} width={CHIP_W} height={CHIP_H} rx={CORNER} fill={colors.accentEdge} />
      <Rect x={x} y={y} width={CHIP_W} height={CHIP_H} rx={CORNER} fill={fill} />
    </React.Fragment>
  );

  // Hidden from screen readers on the wrapping View: on web, Svg forwards props to the DOM.
  return (
    <View aria-hidden>
      <Svg width={size * (VIEW_W / VIEW_H)} height={size} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        {chip(0, 0, colors.accent, 'a')}
        {chip(CHIP_W + GAP, LIFT, colors.text, 'b')}
      </Svg>
    </View>
  );
}
