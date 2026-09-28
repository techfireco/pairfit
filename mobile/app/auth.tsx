import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export default function AuthScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    if (tab === 'login') {
      const res = await signIn(email, password);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        router.replace('/(tabs)/closet');
      }
    } else {
      const res = await signUp(name, email, password);
      setIsSubmitting(false);
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.message) {
        setInfoMessage(res.message);
        setTab('login');
      } else {
        router.replace('/(tabs)/closet');
      }
    }
  };

  const handleOAuthPlaceholder = (provider: 'Apple' | 'Google') => {
    alert(
      `${provider} Sign-In: In this release, use email & password to sign in. ${provider} OAuth is wired in the backend and ready for production provisioning.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>PairFit</Text>
            <Text style={styles.brandSubtitle}>Personal Wardrobe Stylist</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, tab === 'login' && styles.tabButtonActive]}
              onPress={() => {
                setTab('login');
                setErrorMessage('');
              }}
            >
              <Text
                style={[styles.tabButtonText, tab === 'login' && styles.tabButtonTextActive]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, tab === 'register' && styles.tabButtonActive]}
              onPress={() => {
                setTab('register');
                setErrorMessage('');
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  tab === 'register' && styles.tabButtonTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Banners */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color={COLORS.danger} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {infoMessage ? (
            <View style={styles.infoBanner}>
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.infoBannerText}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            {tab === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <User size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Alex Morgan"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your.email@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textSecondary} />
                  ) : (
                    <Eye size={18} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title={tab === 'login' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              style={styles.submitBtn}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-In */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => handleOAuthPlaceholder('Apple')}
            >
              <Text style={styles.appleButtonText}> Continue with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => handleOAuthPlaceholder('Google')}
            >
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Legal note */}
          <Text style={styles.legalNotice}>
            By continuing, you agree to PairFit's{' '}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/legal/terms')}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/legal/privacy')}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.canvas,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.obsidian,
    letterSpacing: -1,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardMuted,
    borderRadius: 9999,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: COLORS.card,
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.obsidian,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.danger,
    fontWeight: '500',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12.5,
    color: '#065F46',
    fontWeight: '500',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14.5,
    color: COLORS.obsidian,
  },
  eyeBtn: {
    padding: 8,
  },
  submitBtn: {
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  socialButtons: {
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: COLORS.card,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: COLORS.obsidian,
    fontSize: 14,
    fontWeight: '600',
  },
  legalNotice: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 28,
  },
  legalLink: {
    color: COLORS.obsidian,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
