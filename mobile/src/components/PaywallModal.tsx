import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Sparkles, Shield, Zap } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Button } from './Button';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: 'annual' | 'monthly') => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const insets = useSafeAreaInsets();

  const handleStartTrial = () => {
    Alert.alert(
      'PairFit Pro — Coming Soon',
      'In-app Pro subscriptions are rolling out soon! As an early member, you will receive exclusive priority access to unlimited wardrobe pairing.',
      [{ text: 'Got it', onPress: onClose }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={20} color={COLORS.obsidian} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.badgeWrap}>
              <View style={styles.proTag}>
                <Sparkles size={13} color="#D97706" />
                <Text style={styles.proTagText}>PAIRFIT PRO</Text>
              </View>
            </View>

            <Text style={styles.headline}>Unlock Unlimited Wardrobe</Text>
            <Text style={styles.subtitle}>
              You've reached the 30-item free wardrobe limit. Upgrade to Pro for unlimited pieces and priority outfit styling.
            </Text>

            {/* Feature List */}
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Check size={14} color="#10B981" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Unlimited Clothing Items</Text>
                  <Text style={styles.featureDesc}>Digitize your entire wardrobe without limits.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Check size={14} color="#10B981" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Instant Color Theory Ranking</Text>
                  <Text style={styles.featureDesc}>Full access to complementary, triadic, and analogous scores.</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.checkIcon}>
                  <Check size={14} color="#10B981" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Permanent Cloud Storage</Text>
                  <Text style={styles.featureDesc}>High-res photo storage with 7-day secure auto-refreshing URLs.</Text>
                </View>
              </View>
            </View>

            {/* Plan Selector */}
            <View style={styles.planSelector}>
              <TouchableOpacity
                onPress={() => setSelectedPlan('annual')}
                style={[
                  styles.planCard,
                  selectedPlan === 'annual' && styles.planCardSelected,
                ]}
              >
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>SAVE 58%</Text>
                </View>
                <Text style={styles.planDuration}>Annual Plan</Text>
                <Text style={styles.planPrice}>$49.99 <Text style={styles.planPeriod}>/ year</Text></Text>
                <Text style={styles.planSubtext}>Just $4.16 / month, billed annually</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPlan('monthly')}
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.planCardSelected,
                ]}
              >
                <Text style={styles.planDuration}>Monthly Plan</Text>
                <Text style={styles.planPrice}>$9.99 <Text style={styles.planPeriod}>/ month</Text></Text>
                <Text style={styles.planSubtext}>Billed monthly, cancel anytime</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Start 3-Day Free Trial"
              onPress={handleStartTrial}
              size="lg"
              style={styles.ctaButton}
            />

            <TouchableOpacity onPress={onClose} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Recurring billing. Cancel anytime in App Store subscriptions at least 24 hours before trial ends.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  badgeWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  proTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.obsidian,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featuresList: {
    backgroundColor: COLORS.canvas,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  featureDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planSelector: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    position: 'relative',
    backgroundColor: COLORS.card,
  },
  planCardSelected: {
    borderColor: COLORS.obsidian,
    backgroundColor: '#FAF9F6',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: COLORS.obsidian,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.obsidian,
    marginTop: 2,
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  planSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ctaButton: {
    marginBottom: 12,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 8,
  },
  restoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerNote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
  },
});
