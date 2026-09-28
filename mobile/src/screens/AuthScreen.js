import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { getSupabase, sendEmailOtp, verifyEmailOtp } from '../services/api';
import { theme } from '../styles/theme';

export default function AuthScreen({ onAuthSuccess }) {
  // authMethod: 'password' | 'otp'
  const [authMethod, setAuthMethod] = useState('password');
  // mode: 'login' | 'register' (for password method)
  const [mode, setMode] = useState('login');
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setInfoMessage('');
  };

  const handlePasswordRegister = async () => {
    clearMessages();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: name.trim() || undefined },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data?.session) {
        setInfoMessage('Account created! Check your email to confirm, then log in.');
        setMode('login');
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    clearMessages();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data?.session) {
        onAuthSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    clearMessages();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await sendEmailOtp(cleanEmail);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setOtpSent(true);
      setInfoMessage(`We sent a 6-digit verification code to ${cleanEmail}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearMessages();
    const cleanEmail = email.trim();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      setErrorMessage('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await verifyEmailOtp(cleanEmail, cleanOtp);
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data?.session) {
        onAuthSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <View style={styles.iconCircle}>
            <Ionicons name="shirt" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>PairFit</Text>
          <Text style={styles.brandTagline}>Upload your clothes. We tell you what goes with what.</Text>
        </View>

        <Card elevation="md" style={styles.authCard}>
          {/* Method Switcher: Password vs Email OTP */}
          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodTab, authMethod === 'password' && styles.methodTabActive]}
              onPress={() => {
                setAuthMethod('password');
                clearMessages();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="key-outline"
                size={15}
                color={authMethod === 'password' ? theme.colors.text : theme.colors.textMuted}
              />
              <Text style={[styles.methodText, authMethod === 'password' && styles.methodTextActive]}>
                Password
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodTab, authMethod === 'otp' && styles.methodTabActive]}
              onPress={() => {
                setAuthMethod('otp');
                clearMessages();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="mail-outline"
                size={15}
                color={authMethod === 'otp' ? theme.colors.text : theme.colors.textMuted}
              />
              <Text style={[styles.methodText, authMethod === 'otp' && styles.methodTextActive]}>
                Email Code / OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Switcher for Password method (Login vs Register) */}
          {authMethod === 'password' && (
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => {
                  setMode('login');
                  clearMessages();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => {
                  setMode('register');
                  clearMessages();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Inline Feedback Messages */}
          {infoMessage ? (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#059669" />
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* PASSWORD METHOD FIELDS */}
          {authMethod === 'password' ? (
            <>
              {mode === 'register' && (
                <Input
                  label="Your Name"
                  placeholder="e.g. Alex Smith"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}

              <Input
                label="Email Address"
                placeholder="alex@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Password"
                placeholder="Min. 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                title={mode === 'login' ? 'Sign In' : 'Create Account'}
                onPress={mode === 'login' ? handlePasswordLogin : handlePasswordRegister}
                loading={loading}
                size="lg"
                style={styles.submitBtn}
              />
            </>
          ) : (
            /* EMAIL OTP METHOD FIELDS */
            <>
              {!otpSent ? (
                <>
                  <Input
                    label="Email Address"
                    placeholder="alex@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Button
                    title="Send Verification Code"
                    onPress={handleSendOtp}
                    loading={loading}
                    size="lg"
                    style={styles.submitBtn}
                  />
                  <Text style={styles.otpHint}>
                    We will send a 6-digit one-time code to your email. No password required.
                  </Text>
                </>
              ) : (
                <>
                  <Input
                    label="6-Digit Verification Code"
                    placeholder="123456"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />

                  <Button
                    title="Verify & Enter"
                    onPress={handleVerifyOtp}
                    loading={loading}
                    size="lg"
                    style={styles.submitBtn}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      clearMessages();
                    }}
                    style={styles.resendBtn}
                  >
                    <Text style={styles.resendText}>Use a different email or re-send</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          <Text style={styles.fineprint}>
            Your wardrobe items are safely stored in your private cloud account — surviving device switches.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing[5],
    paddingVertical: theme.spacing[8],
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
    ...theme.shadows.md,
  },
  brandTitle: {
    fontSize: theme.typography['2xl'].fontSize,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing[1],
    maxWidth: 280,
  },
  authCard: {
    padding: theme.spacing[6],
  },
  methodSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing[4],
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  methodTabActive: {
    borderBottomColor: theme.colors.primary,
  },
  methodText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  methodTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.chipBg,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing[4],
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successBg,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[4],
    gap: 8,
  },
  infoText: {
    fontSize: theme.typography.sm.fontSize,
    color: '#065F46',
    flex: 1,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: theme.spacing[3],
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing[4],
    gap: 8,
  },
  errorText: {
    fontSize: theme.typography.sm.fontSize,
    color: '#991B1B',
    flex: 1,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  otpHint: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  resendText: {
    fontSize: theme.typography.sm.fontSize,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  fineprint: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing[1],
  },
});
