// PairFit Central Design Tokens
export const theme = {
  colors: {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    surfaceSubtle: '#F3F4F6',
    border: '#E5E7EB',
    borderFocus: '#18181B',
    
    // Text
    text: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Brand & Actions
    primary: '#18181B',
    primaryHover: '#27272A',
    primarySubtle: '#27272A10',
    accent: '#2563EB',
    accentSubtle: '#EFF6FF',

    // Status & States
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    dangerArm: '#991B1B',

    // UI Elements
    chipBg: '#F3F4F6',
    skeleton: '#E5E7EB',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },

  // 8pt Spacing Grid
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },

  // Typography scale
  typography: {
    xs: { fontSize: 11, lineHeight: 15 },
    sm: { fontSize: 13, lineHeight: 18 },
    base: { fontSize: 15, lineHeight: 22 },
    md: { fontSize: 17, lineHeight: 24 },
    lg: { fontSize: 20, lineHeight: 28 },
    xl: { fontSize: 24, lineHeight: 32 },
    '2xl': { fontSize: 28, lineHeight: 36 },
    '3xl': { fontSize: 34, lineHeight: 42 },
  },

  // Border Radii
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Elevated Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
