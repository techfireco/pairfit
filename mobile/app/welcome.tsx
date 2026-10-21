import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, Gauge, MessageSquareText } from 'lucide-react-native';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../src/theme';
import { Button } from '../src/components/Button';
import { Logo } from '../src/components/Logo';
import { ScoreRing } from '../src/components/ScoreRing';
import { SwatchStack } from '../src/components/SwatchStack';

const FEATURES = [
  { Icon: Camera, title: 'Snap once', body: 'Your closet lives in the cloud, on every device.' },
  { Icon: Gauge, title: 'Ranked matches', body: 'Every pairing scored from 0 to 99.' },
  { Icon: MessageSquareText, title: 'Plain-English reasons', body: 'Know why two pieces work together.' },
];

export default function WelcomeScreen() {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <Logo size={24} />
          <Text style={styles.brandName}>PairFit</Text>
        </View>

        <View style={styles.hero}>
          <SwatchStack size={150} />
          <Animated.View entering={FadeInDown.duration(420).delay(320)} style={styles.heroScore}>
            <ScoreRing score={94} size={64} />
          </Animated.View>
        </View>

        <Text style={styles.overline}>Color-matched outfits</Text>
        <Text style={styles.headline} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
          What do I wear with this?
        </Text>
        <Text style={styles.body}>
          Snap your clothes once. PairFit scores every pairing in your closet with color theory and tells
          you why it works.
        </Text>

        <View style={styles.features}>
          {FEATURES.map(({ Icon, title, body }) => (
            <View key={title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Icon size={18} color={colors.accentText} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          title="Get started"
          onPress={() => router.push('/auth')}
          size="lg"
          icon={<ArrowRight size={18} color={colors.textOnAccent} />}
          iconPosition="right"
        />
        <Pressable onPress={() => router.push('/auth')} style={styles.signIn} accessibilityRole="button">
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInStrong}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    container: {
      paddingHorizontal: SPACING.xl + 2,
      paddingTop: SPACING.lg,
      paddingBottom: SPACING.xxxl,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    brandName: {
      ...TYPE.subheading,
      color: colors.text,
    },
    hero: {
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: SPACING.lg,
    },
    heroScore: {
      position: 'absolute',
      right: '12%',
      bottom: SPACING.lg,
      backgroundColor: colors.surface,
      borderRadius: 40,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      padding: SPACING.sm,
    },
    overline: {
      ...TYPE.overline,
      color: colors.accentText,
      marginBottom: SPACING.sm,
    },
    headline: {
      ...TYPE.display,
      fontSize: 38,
      lineHeight: 42,
      color: colors.text,
    },
    body: {
      ...TYPE.body,
      color: colors.textSecondary,
      marginTop: SPACING.md,
    },
    features: {
      marginTop: SPACING.xxl,
      marginBottom: SPACING.xxxl,
      gap: SPACING.lg,
    },
    feature: {
      flexDirection: 'row',
      gap: SPACING.md + 2,
      alignItems: 'center',
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: colors.accentSoft,
      borderWidth: 1,
      borderColor: colors.accentEdge,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      ...TYPE.subheading,
      fontSize: 15,
      color: colors.text,
    },
    featureBody: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },
    signIn: {
      alignItems: 'center',
      paddingVertical: SPACING.lg,
    },
    signInText: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },
    signInStrong: {
      color: colors.text,
      textDecorationLine: 'underline',
    },
  });
