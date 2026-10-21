import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X, Sparkles } from 'lucide-react-native';
import { useTheme, useThemedStyles, Theme, TYPE, RADIUS, SPACING, MAX_FONT_SCALE } from '../theme';
import { CATEGORY_GROUPS_MAP, CategoryValue } from '../types';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';
import { uploadItemApi, ApiError } from '../api/client';
import { getUserFriendlyErrorMessage } from '../utils/errors';
import { haptics } from '../utils/haptics';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLimitReached: () => void;
}

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.85,
};

export function AddItemModal({ visible, onClose, onSuccess, onLimitReached }: AddItemModalProps) {
  const { colors } = useTheme().theme;
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryValue | null>(null); // No default category
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setErrorMessage('');
    setPhotoUri(null);
    setName('');
    setCategory(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async (useCamera: boolean) => {
    setErrorMessage('');
    try {
      let result: ImagePicker.ImagePickerResult;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Camera access needed', 'Allow camera access in Settings to photograph your clothes.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      } else {
        // The system photo picker needs no permission on iOS or Android, so we
        // never ask for broad photo access (Google Play photo/video policy).
        result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      setErrorMessage(getUserFriendlyErrorMessage(err, 'Pick Image'));
    }
  };

  const handleUpload = async () => {
    if (!photoUri) {
      setErrorMessage('Pick or take a photo first.');
      return;
    }
    if (!category) {
      setErrorMessage('Choose a category.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    try {
      await uploadItemApi({ photoUri, name: name.trim() || 'Untitled piece', category });
      haptics.success();
      resetForm();
      setIsUploading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      if (err instanceof ApiError && err.upgrade) {
        onClose();
        onLimitReached();
      } else {
        setErrorMessage(getUserFriendlyErrorMessage(err, 'Upload Item'));
      }
    }
  };

  const submitTitle = isUploading
    ? 'Adding…'
    : !photoUri
    ? 'Pick a photo first'
    : !category
    ? 'Choose a category'
    : 'Add to closet';

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, SPACING.xl) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                New piece
              </Text>
              <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                We'll detect its main color for you
              </Text>
            </View>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {photoUri ? (
              <View style={styles.preview}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} accessibilityLabel="Selected photo" />
                <Pressable
                  style={styles.changePhoto}
                  onPress={() => setPhotoUri(null)}
                  accessibilityRole="button"
                >
                  <Text style={styles.changePhotoText}>Change photo</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.pickerRow}>
                <PickerTile label="Take photo" onPress={() => pickImage(true)} styles={styles}>
                  <Camera size={24} color={colors.accentText} />
                </PickerTile>
                <PickerTile label="Gallery" onPress={() => pickImage(false)} styles={styles}>
                  <ImageIcon size={24} color={colors.accentText} />
                </PickerTile>
              </View>
            )}

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Navy linen shirt"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={50}
              accessibilityLabel="Name (optional)"
              selectionColor={colors.accent}
            />

            <View style={styles.categoryHeader}>
              <Text style={styles.label}>Category</Text>
              {!category && <Text style={styles.required}>Required</Text>}
            </View>
            {Object.entries(CATEGORY_GROUPS_MAP).map(([groupKey, group]) => (
              <View key={groupKey} style={styles.categoryGroup}>
                <Text style={styles.groupTitle}>{group.title}</Text>
                <View style={styles.chipGrid}>
                  {group.categories.map((c) => {
                    const isSelected = category === c.value;
                    return (
                      <Pressable
                        key={c.value}
                        onPress={() => {
                          haptics.selection();
                          setCategory(c.value);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{c.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            {errorMessage ? <ErrorBanner error={errorMessage} onDismiss={() => setErrorMessage('')} /> : null}

            <View style={styles.notice}>
              <Sparkles size={16} color={colors.accentText} />
              <Text style={styles.noticeText}>Plain backgrounds give the most accurate colors.</Text>
            </View>

            <Button
              title={submitTitle}
              onPress={handleUpload}
              loading={isUploading}
              disabled={!photoUri || !category || isUploading}
              size="lg"
              accessibilityLabel={submitTitle}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PickerTile({
  label,
  onPress,
  styles,
  children,
}: {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.pickerTile, pressed && styles.pickerTilePressed]}
    >
      {children}
      <Text style={styles.pickerText}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: '92%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderStrong,
      marginTop: SPACING.sm + 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.md,
    },
    headerText: {
      flex: 1,
    },
    title: {
      ...TYPE.heading,
      color: colors.text,
    },
    subtitle: {
      ...TYPE.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: SPACING.xl,
      paddingBottom: SPACING.lg,
    },
    pickerRow: {
      flexDirection: 'row',
      gap: SPACING.md,
      marginBottom: SPACING.xl,
    },
    pickerTile: {
      flex: 1,
      height: 116,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceSunken,
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
    },
    pickerTilePressed: {
      borderColor: colors.accent,
      backgroundColor: colors.accentSoft,
    },
    pickerText: {
      ...TYPE.subheading,
      fontSize: 15,
      color: colors.text,
    },
    preview: {
      marginBottom: SPACING.xl,
    },
    previewImage: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: RADIUS.lg,
      backgroundColor: colors.surfaceRaised,
    },
    changePhoto: {
      position: 'absolute',
      right: SPACING.md,
      bottom: SPACING.md,
      backgroundColor: colors.overlay,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.md + 2,
      paddingVertical: SPACING.sm,
    },
    changePhotoText: {
      ...TYPE.caption,
      color: '#F4F1EA',
    },
    label: {
      ...TYPE.overline,
      color: colors.textSecondary,
      marginBottom: SPACING.sm,
    },
    input: {
      ...TYPE.body,
      color: colors.text,
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md + 1,
      marginBottom: SPACING.xl,
      outlineWidth: 0,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    required: {
      ...TYPE.caption,
      fontSize: 12,
      color: colors.accentText,
    },
    categoryGroup: {
      marginBottom: SPACING.md + 2,
    },
    groupTitle: {
      ...TYPE.caption,
      color: colors.textMuted,
      marginBottom: SPACING.sm,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    chip: {
      paddingHorizontal: SPACING.md + 2,
      paddingVertical: SPACING.sm,
      minHeight: 38,
      justifyContent: 'center',
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    chipSelected: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    chipText: {
      ...TYPE.caption,
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: colors.accentText,
    },
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingVertical: SPACING.md,
      marginBottom: SPACING.sm,
    },
    noticeText: {
      ...TYPE.caption,
      color: colors.textMuted,
      flex: 1,
    },
  });
