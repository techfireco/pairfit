import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../src/constants/theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: September 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Information We Collect</Text>
          <Text style={styles.body}>
            We collect the following personal and usage data to provide our wardrobe pairing services:
            {'\n'}• Account Credentials: Email address, encrypted password hash, and optional display name.
            {'\n'}• Wardrobe Content: Photographs of clothing items you choose to capture or upload.
            {'\n'}• Extracted Color Attributes: Dominant color hex codes and HSL (hue, saturation, lightness) metrics extracted from your photos.
            {'\n'}• Category & Metadata: Garment category tags (e.g., T-shirt, Jeans, Jacket) and piece titles.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. How Your Information Is Used</Text>
          <Text style={styles.body}>
            Your information is used solely to:
            {'\n'}• Maintain your personal digital wardrobe across devices.
            {'\n'}• Analyze color harmonies and generate outfit recommendations between your clothing items.
            {'\n'}• Enforce account security and free/pro quota tiers.
            {'\n'}We do not sell, rent, or monetize your personal data or clothing images.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Storage & Photo Privacy</Text>
          <Text style={styles.body}>
            Your photos are stored in a private cloud storage bucket. Access to your photos is protected by per-user Row-Level Security (RLS) policies. Photos are served exclusively via temporary server-signed URLs with a 7-day expiration time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Third-Party Infrastructure</Text>
          <Text style={styles.body}>
            We utilize trusted infrastructure partners to operate our service:
            {'\n'}• Supabase: Cloud Authentication, PostgreSQL database, and private object storage.
            {'\n'}• Server-Side Image Processing: Sharp image library for dominant color extraction (runs on our private API server).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Data Retention & Right to Erasure</Text>
          <Text style={styles.body}>
            You have full control over your data:
            {'\n'}• Item Deletion: Removing any piece deletes its database record and cloud storage file immediately.
            {'\n'}• Account Deletion: You can permanently delete your entire account through the Profile screen. This removes all your personal data, wardrobe items, and uploaded images permanently from our systems.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Contact Information</Text>
          <Text style={styles.body}>
            If you have questions or privacy concerns, please contact our data privacy officer at privacy@getpairfit.com.
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.obsidian,
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.charcoal,
  },
});
