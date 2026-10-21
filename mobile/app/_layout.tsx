import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme, FONTS } from '../src/theme';
import { ToastProvider } from '../src/components/Toast';

// Keep the native splash up until fonts and the saved appearance are ready.
SplashScreen.preventAutoHideAsync().catch((err) => console.warn('Splash screen:', err));

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    // Fall back to system fonts rather than blocking the app on a font failure.
    if (fontError) console.error('Could not load fonts:', fontError);
  }, [fontError]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp fontsReady={fontsLoaded || Boolean(fontError)} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function ThemedApp({ fontsReady }: { fontsReady: boolean }) {
  const { theme, isReady: themeReady } = useTheme();
  const isReady = fontsReady && themeReady;
  const { colors } = theme;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync().catch((err) => console.warn('Splash screen:', err));
  }, [isReady]);

  if (!isReady) return null;

  const legalHeader = {
    headerShown: true,
    headerBackTitle: 'Back',
    headerTintColor: colors.text,
    headerStyle: { backgroundColor: colors.canvas },
    headerTitleStyle: { fontFamily: FONTS.displaySemiBold, color: colors.text },
    headerShadowVisible: false,
  };

  return (
    <ToastProvider>
      <AuthProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth" options={{ presentation: 'card' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="legal/terms" options={{ ...legalHeader, title: 'Terms of Service' }} />
          <Stack.Screen name="legal/privacy" options={{ ...legalHeader, title: 'Privacy Policy' }} />
        </Stack>
      </AuthProvider>
    </ToastProvider>
  );
}
