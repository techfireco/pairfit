import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../src/constants/theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: September 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Acceptance of Terms</Text>
          <Text style={styles.body}>
            By creating an account or accessing PairFit ("Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Service Description</Text>
          <Text style={styles.body}>
            PairFit is a personal wardrobe outfit-recommendation application. Users upload photographs of their clothing garments, which are stored securely on our servers. PairFit extracts dominant color values using server-side image processing and evaluates potential pairings using color theory principles (such as complementary, analogous, monochromatic, and neutral harmony).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. User Accounts & Responsibilities</Text>
          <Text style={styles.body}>
            You must register with a valid email address and password. You are responsible for safeguarding your credentials and for all activities that occur under your account. You agree not to upload any illegal, defamatory, infringing, or inappropriate photographs.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. User-Generated Content & Ownership</Text>
          <Text style={styles.body}>
            You retain all ownership rights to the clothing photos you upload. By uploading content, you grant PairFit a limited license solely to host, process (such as downscaling and dominant color extraction), and display your photos back to you within the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Free Plan & Usage Quotas</Text>
          <Text style={styles.body}>
            Free accounts may store up to 30 clothing items. Attempting to upload beyond this limit will require upgrading to a PairFit Pro subscription plan. We reserve the right to modify usage limits upon reasonable notice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Algorithmic Recommendations Disclaimer</Text>
          <Text style={styles.body}>
            PairFit's outfit recommendations, compatibility scores, and color theory reasons are provided for informational and styling inspiration only. Fashion and aesthetic preferences are subjective. PairFit provides no warranties regarding the accuracy or suitability of style recommendations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Account Deletion & Termination</Text>
          <Text style={styles.body}>
            You may permanently delete your account and all associated wardrobe items at any time through the Profile screen. Upon deletion, your items, database rows, and stored photos are permanently removed.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Contact Us</Text>
          <Text style={styles.body}>
            If you have questions regarding these Terms, contact us at support@getpairfit.com.
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
