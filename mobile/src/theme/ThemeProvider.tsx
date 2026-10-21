import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, darkTheme, lightTheme } from './themes';

export type ThemePreference = 'dark' | 'light' | 'system';

export const THEME_STORAGE_KEY = 'pairfit.appearance';
const THEME_PREFERENCES: readonly ThemePreference[] = ['dark', 'light', 'system'];
// Noir is dark-first: dark until the person picks otherwise in Profile.
const DEFAULT_PREFERENCE: ThemePreference = 'dark';

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  // False until the saved preference is read, so the splash can hide without a flash.
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(DEFAULT_PREFERENCE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (isMounted && isThemePreference(stored)) setPreferenceState(stored);
      })
      .catch((err) => console.warn('Could not read the appearance setting:', err))
      .finally(() => {
        if (isMounted) setIsReady(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((err) =>
      console.warn('Could not save the appearance setting:', err)
    );
  }, []);

  const mode = preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  const theme = mode === 'light' ? lightTheme : darkTheme;

  const value = useMemo(
    () => ({ theme, preference, setPreference, isReady }),
    [theme, preference, setPreference, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Builds a StyleSheet from the current theme; pass a module-level factory so it memoizes.
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
