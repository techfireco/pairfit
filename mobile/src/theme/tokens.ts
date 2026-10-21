import { TextStyle } from 'react-native';

// Font family names as registered by @expo-google-fonts (see app/_layout.tsx).
export const FONTS = {
  displayBold: 'SpaceGrotesk_700Bold',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
} as const;

// Space Grotesk carries headings, numbers and buttons; Inter carries reading text.
export const TYPE = {
  display: { fontFamily: FONTS.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -1 },
  title: { fontFamily: FONTS.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  heading: { fontFamily: FONTS.displaySemiBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  subheading: { fontFamily: FONTS.displaySemiBold, fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: FONTS.bodySemiBold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: FONTS.bodyMedium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: FONTS.bodySemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  button: { fontFamily: FONTS.displaySemiBold, fontSize: 16, lineHeight: 20, letterSpacing: 0.2 },
  score: { fontFamily: FONTS.displayBold, fontSize: 20, lineHeight: 24, letterSpacing: -0.5 },
} satisfies Record<string, TextStyle>;

// Large Dynamic Type sizes still scale, but dense controls stop growing here.
export const MAX_FONT_SCALE = 1.4;

// Depth of the 3D "pop" edge on primary buttons, per size.
export const POP_DEPTH = { sm: 3, md: 4, lg: 5 } as const;
