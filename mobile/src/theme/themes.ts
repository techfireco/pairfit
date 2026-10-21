export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  canvas: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  // Gold: `accent` is the fill, `accentEdge` the 3D edge under it, `accentText`
  // the shade that stays readable as text on this theme's backgrounds.
  accent: string;
  accentEdge: string;
  accentText: string;
  accentSoft: string;
  textOnAccent: string;
  danger: string;
  dangerSoft: string;
  dangerText: string;
  success: string;
  successSoft: string;
  overlay: string;
  tabBar: string;
  skeleton: string;
  swatchBorder: string;
  chipSelected: string;
  chipSelectedText: string;
  scoreHigh: string;
  scoreMid: string;
  scoreLow: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// Noir: near-black canvas, warm ivory text, champagne gold as the only accent.
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    canvas: '#0D0D0F',
    surface: '#17171A',
    surfaceRaised: '#1F1F23',
    surfaceSunken: '#111113',
    border: '#2A2A2F',
    borderStrong: '#3A3A41',
    text: '#F4F1EA',
    textSecondary: '#B3AFA6',
    textMuted: '#8C8981',
    accent: '#D9B97A',
    accentEdge: '#8C7342',
    accentText: '#D9B97A',
    accentSoft: '#2A2418',
    textOnAccent: '#1A1408',
    danger: '#F07A6A',
    dangerSoft: '#2B1714',
    dangerText: '#F59A8C',
    success: '#8FD3AE',
    successSoft: '#14261D',
    overlay: 'rgba(0, 0, 0, 0.62)',
    tabBar: '#121214',
    skeleton: '#232327',
    swatchBorder: 'rgba(255, 255, 255, 0.18)',
    chipSelected: '#F4F1EA',
    chipSelectedText: '#0D0D0F',
    scoreHigh: '#D9B97A',
    scoreMid: '#C9C3B6',
    scoreLow: '#8C8981',
  },
};

// Same gold accent on warm ivory paper; gold text darkens to stay readable.
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    canvas: '#F6F3EC',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    surfaceSunken: '#EFEBE2',
    border: '#E4DFD4',
    borderStrong: '#CFC8BA',
    text: '#141414',
    textSecondary: '#57534B',
    textMuted: '#6F6A62',
    accent: '#D9B97A',
    accentEdge: '#8C7342',
    accentText: '#7E6029',
    accentSoft: '#F3EAD6',
    textOnAccent: '#1A1408',
    danger: '#C0392B',
    dangerSoft: '#FBEAE7',
    dangerText: '#A82B1F',
    success: '#1E7A4E',
    successSoft: '#E5F3EC',
    overlay: 'rgba(20, 20, 20, 0.45)',
    tabBar: '#FFFFFF',
    skeleton: '#ECE7DD',
    swatchBorder: 'rgba(0, 0, 0, 0.12)',
    chipSelected: '#141414',
    chipSelectedText: '#F6F3EC',
    scoreHigh: '#7E6029',
    scoreMid: '#57534B',
    scoreLow: '#6F6A62',
  },
};
