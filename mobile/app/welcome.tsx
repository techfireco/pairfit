import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { Sparkles, Palette, Layers, ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>PairFit</Text>
          <Text style={styles.brandSubtitle}>Wardrobe Intelligence</Text>
        </View>

        {/* Editorial Hero Banner */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroPill}>
              <Sparkles size={13} color="#FFFFFF" />
              <Text style={styles.heroPillText}>COLOR THEORY ENGINE</Text>
            </View>
            <Text style={styles.heroHeadline}>
              What should I{'\n'}wear with this?
            </Text>
          </View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Layers size={18} color={COLORS.obsidian} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Upload Clothes Once</Text>
              <Text style={styles.featureDesc}>
                Take photos with your camera or select from your gallery. Sharp auto-detects dominant colors.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Palette size={18} color={COLORS.obsidian} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ranked Harmony Matches</Text>
              <Text style={styles.featureDesc}>
                Tap any garment to get matches scored 0–99 based on complementary, monochrome, and analogous rules.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Sparkles size={18} color={COLORS.obsidian} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Plain-English Reasons</Text>
              <Text style={styles.featureDesc}>
                Never second-guess an outfit. Understand exactly why two tones complement each other.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title="Get Started"
            onPress={() => router.push('/auth')}
            size="lg"
            icon={<ArrowRight size={18} color="#FFFFFF" />}
            style={styles.getStartedBtn}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth')}
            style={styles.loginHintRow}
          >
            <Text style={styles.loginHint}>Already have an account? </Text>
            <Text style={styles.loginHintBold}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  heroCard: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.cardMuted,
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 20,
    justifyContent: 'flex-end',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  features: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  featureDesc: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  actionContainer: {
    alignItems: 'center',
  },
  getStartedBtn: {
    width: '100%',
    marginBottom: 14,
  },
  loginHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  loginHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  loginHintBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
});
