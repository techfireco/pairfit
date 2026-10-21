import React from 'react';
import { ThemeProvider } from '../src/theme';
import { ToastProvider } from '../src/components/Toast';

// Wrap rendered UI in the same providers the app root uses.
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
