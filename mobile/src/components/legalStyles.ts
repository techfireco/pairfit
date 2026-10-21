import { StyleSheet } from 'react-native';
import { Theme, TYPE, SPACING } from '../theme';

// Shared typography for the Terms of Service and Privacy Policy screens.
export const makeLegalStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    container: {
      padding: SPACING.xl,
      paddingBottom: SPACING.xxxl + SPACING.sm,
    },
    title: {
      ...TYPE.title,
      color: colors.text,
      marginBottom: SPACING.xs,
    },
    lastUpdated: {
      ...TYPE.caption,
      color: colors.textMuted,
      marginBottom: SPACING.xl,
    },
    section: {
      marginBottom: SPACING.xl,
    },
    heading: {
      ...TYPE.subheading,
      color: colors.text,
      marginBottom: SPACING.sm - 2,
    },
    body: {
      ...TYPE.body,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
    },
  });
