import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  style,
  inputStyle,
  maxLength,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.textInput, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hidePassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setHidePassword(!hidePassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={hidePassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },
  label: {
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    height: 48,
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerBg,
  },
  textInput: {
    flex: 1,
    fontSize: theme.typography.base.fontSize,
    color: theme.colors.text,
    height: '100%',
  },
  iconLeft: {
    marginRight: theme.spacing[2],
  },
  iconRight: {
    marginLeft: theme.spacing[2],
  },
  errorText: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.danger,
    fontWeight: '600',
    marginTop: theme.spacing[1],
  },
});
