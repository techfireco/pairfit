import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { theme } from '../../styles/theme';

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          style={styles.actionBtn}
          size="md"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[10],
    paddingHorizontal: theme.spacing[6],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[4],
  },
  title: {
    fontSize: theme.typography.lg.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: theme.spacing[6],
  },
  actionBtn: {
    minWidth: 160,
  },
});
