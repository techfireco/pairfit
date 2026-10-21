import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../src/theme';
import { Button } from '../src/components/Button';
import { ErrorBanner } from '../src/components/ErrorBanner';
import { Logo } from '../src/components/Logo';
import { haptics } from '../src/utils/haptics';

type AuthTab = 'login' | 'register';
const MIN_PASSWORD_LENGTH = 6;

export default function AuthScreen() {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const switchTab = (next: AuthTab) => {
    if (next !== tab) haptics.selection();
    setTab(next);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setIsSubmitting(true);
    if (tab === 'login') {
      const res = await signIn(email, password);
      setIsSubmitting(false);
      if (res.error) setErrorMessage(res.error);
      else router.replace('/(tabs)/closet');
      return;
    }

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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Logo size={44} />
            <Text style={styles.wordmark} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
              PairFit
            </Text>
            <Text style={styles.tagline}>Your closet, styled by color.</Text>
          </View>

          <View style={styles.tabs} accessibilityRole="tablist">
            {(['login', 'register'] as const).map((key) => {
              const isActive = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => switchTab(key)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  style={[styles.tab, isActive && styles.tabActive]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {key === 'login' ? 'Sign in' : 'Create account'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {errorMessage ? <ErrorBanner error={errorMessage} onDismiss={() => setErrorMessage('')} /> : null}
          {infoMessage ? (
            <View style={styles.infoBanner} accessibilityRole="alert">
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {tab === 'register' && (
              <Field
                label="Name"
                styles={styles}
                placeholder="Alex Morgan"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
              />
            )}
            <Field
              label="Email"
              styles={styles}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Field
              label="Password"
              styles={styles}
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              textContentType={tab === 'login' ? 'password' : 'newPassword'}
              trailing={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textSecondary} />
                  ) : (
                    <Eye size={18} color={colors.textSecondary} />
                  )}
                </Pressable>
              }
            />

            <Button
              title={tab === 'login' ? 'Sign in' : 'Create account'}
              onPress={handleSubmit}
              loading={isSubmitting}
              size="lg"
              style={styles.submit}
            />
          </View>

          <Text style={styles.legal}>
            By continuing, you agree to PairFit's{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/terms')} accessibilityRole="link">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/privacy')} accessibilityRole="link">
              Privacy Policy
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  styles,
  trailing,
  ...inputProps
}: TextInputProps & { label: string; styles: ReturnType<typeof makeStyles>; trailing?: React.ReactNode }) {
  const { colors } = useTheme().theme;
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          accessibilityLabel={label}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {trailing}
      </View>
    </View>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    flex: {
      flex: 1,
    },
    container: {
      paddingHorizontal: SPACING.xl + 2,
      paddingTop: SPACING.xxxl,
      paddingBottom: SPACING.xxxl,
    },
    brand: {
      alignItems: 'center',
      marginBottom: SPACING.xxxl,
    },
    wordmark: {
      ...TYPE.display,
      color: colors.text,
      marginTop: SPACING.md,
    },
    tagline: {
      ...TYPE.body,
      color: colors.textSecondary,
      marginTop: 2,
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSunken,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SPACING.xs,
      marginBottom: SPACING.xxl,
    },
    tab: {
      flex: 1,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.sm,
    },
    tabActive: {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    tabText: {
      ...TYPE.caption,
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.text,
    },
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: colors.success,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    infoText: {
      ...TYPE.caption,
      color: colors.text,
      flex: 1,
    },
    form: {
      gap: SPACING.lg,
    },
    label: {
      ...TYPE.overline,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
    },
    inputWrapFocused: {
      borderColor: colors.accent,
    },
    input: {
      ...TYPE.body,
      flex: 1,
      color: colors.text,
      paddingVertical: SPACING.md + 2,
      // The wrapper's gold border is the focus indicator; drop the browser's ring on web.
      outlineWidth: 0,
    },
    eyeButton: {
      padding: SPACING.xs,
      marginLeft: SPACING.sm,
    },
    submit: {
      marginTop: SPACING.sm,
    },
    legal: {
      ...TYPE.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: SPACING.xxl,
    },
    legalLink: {
      color: colors.text,
      textDecorationLine: 'underline',
    },
  });
