import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.canvas },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="auth" options={{ presentation: 'card' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="legal/terms"
          options={{
            headerShown: true,
            title: 'Terms of Service',
            headerBackTitle: 'Back',
            headerTintColor: COLORS.obsidian,
            headerStyle: { backgroundColor: COLORS.card },
          }}
        />
        <Stack.Screen
          name="legal/privacy"
          options={{
            headerShown: true,
            title: 'Privacy Policy',
            headerBackTitle: 'Back',
            headerTintColor: COLORS.obsidian,
            headerStyle: { backgroundColor: COLORS.card },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
