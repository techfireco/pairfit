import React from 'react';
import * as ReactNative from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from '../../src/theme';
import { darkTheme, lightTheme } from '../../src/theme/themes';

function mockSystemScheme(scheme: ReactNative.ColorSchemeName) {
  jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(scheme);
}

async function renderTheme() {
  const hook = await renderHook(() => useTheme(), { wrapper: ThemeProvider });
  await waitFor(() => expect(hook.result.current.isReady).toBe(true));
  return hook;
}

beforeEach(async () => {
  jest.restoreAllMocks();
  await AsyncStorage.clear();
});

describe('ThemeProvider', () => {
  it('is dark by default, even when the phone is in light mode', async () => {
    mockSystemScheme('light');

    const { result } = await renderTheme();

    expect(result.current.preference).toBe('dark');
    expect(result.current.theme.mode).toBe('dark');
    expect(result.current.theme.colors).toEqual(darkTheme.colors);
  });

  it('follows the phone setting when the preference is "system"', async () => {
    mockSystemScheme('light');
    const { result } = await renderTheme();

    await act(async () => {
      result.current.setPreference('system');
    });

    expect(result.current.theme.mode).toBe('light');
    expect(result.current.theme.colors).toEqual(lightTheme.colors);
  });

  it('remembers the chosen appearance between launches', async () => {
    mockSystemScheme('dark');
    const first = await renderTheme();

    await act(async () => {
      first.result.current.setPreference('light');
    });
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    );
    await first.unmount();

    const second = await renderTheme();
    expect(second.result.current.preference).toBe('light');
    expect(second.result.current.theme.mode).toBe('light');
  });

  it('ignores an unknown stored value and stays dark', async () => {
    mockSystemScheme('light');
    await AsyncStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    const { result } = await renderTheme();

    expect(result.current.preference).toBe('dark');
  });
});

describe('theme contrast', () => {
  // WCAG relative luminance, so text colors can't silently regress below AA.
  function luminance(hex: string) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }
  function contrast(a: string, b: string) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }

  it.each([
    ['dark', darkTheme],
    ['light', lightTheme],
  ])('%s theme text colors meet WCAG AA (4.5:1) on canvas and cards', (_name, theme) => {
    const { colors } = theme;
    for (const bg of [colors.canvas, colors.surface]) {
      for (const fg of [colors.text, colors.textSecondary, colors.textMuted, colors.accentText, colors.dangerText]) {
        expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(contrast(colors.textOnAccent, colors.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
