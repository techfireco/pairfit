import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';

export default function IndexScreen() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (session) {
        router.replace('/(tabs)/closet');
      } else {
        router.replace('/welcome');
      }
    }
  }, [session, isLoading, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>PairFit</Text>
      <Text style={styles.tagline}>Your closet, curated.</Text>
      <ActivityIndicator size="small" color={COLORS.obsidian} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  spinner: {
    marginTop: 24,
  },
});
