import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useTheme, useThemedStyles, Theme, TYPE, SPACING } from '../src/theme';
import { Logo } from '../src/components/Logo';

export default function IndexScreen() {
  const { session, isLoading } = useAuth();
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(session ? '/(tabs)/closet' : '/welcome');
  }, [session, isLoading, router]);

  return (
    <View style={styles.container}>
      <Logo size={48} />
      <Text style={styles.brand}>PairFit</Text>
      <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} accessibilityLabel="Loading" />
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.xxl,
    },
    brand: {
      ...TYPE.display,
      color: colors.text,
      marginTop: SPACING.md,
    },
    spinner: {
      marginTop: SPACING.xxl,
    },
  });
