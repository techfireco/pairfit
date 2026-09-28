import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../../styles/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      case 'danger':
        return styles.textDanger;
      default:
        return styles.textPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.textSizeSm;
      case 'lg':
        return styles.textSizeLg;
      default:
        return styles.textSizeMd;
    }
  };

  const isDark = variant === 'primary' || variant === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.baseText, getVariantTextStyle(), getTextSizeStyle(), textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing[2],
  },
  baseText: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  textSecondary: {
    color: theme.colors.text,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  textOutline: {
    color: theme.colors.text,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  textGhost: {
    color: theme.colors.textSecondary,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  textDanger: {
    color: '#FFFFFF',
  },
  // Sizes
  sizeSm: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  textSizeSm: {
    fontSize: theme.typography.sm.fontSize,
  },
  sizeMd: {
    paddingVertical: 12,
    paddingHorizontal: theme.spacing[4],
  },
  textSizeMd: {
    fontSize: theme.typography.base.fontSize,
  },
  sizeLg: {
    paddingVertical: 15,
    paddingHorizontal: theme.spacing[6],
  },
  textSizeLg: {
    fontSize: theme.typography.md.fontSize,
  },
  disabled: {
    opacity: 0.6,
  },
});
