import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { COLORS } from '../constants/theme';
import { CATEGORY_GROUPS_MAP, CategoryValue } from '../types';
import { Button } from './Button';
import { ErrorBanner } from './ErrorBanner';
import { uploadItemApi, ApiError } from '../api/client';
import { getUserFriendlyErrorMessage } from '../utils/errors';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUpgrade: () => void;
}

export function AddItemModal({ visible, onClose, onSuccess, onUpgrade }: AddItemModalProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryValue | null>(null); // C2: No default category preselected
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const insets = useSafeAreaInsets();

  const handleClose = () => {
    setErrorMessage('');
    setPhotoUri(null);
    setName('');
    setCategory(null);
    onClose();
  };

  const pickImage = async (useCamera: boolean) => {
    setErrorMessage('');
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to snap clothing photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Photo library permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
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
      setErrorMessage('Please select or snap a clothing photo first.');
      return;
    }

    if (!category) {
      setErrorMessage('Please select a clothing category.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      await uploadItemApi({
        photoUri,
        name: name.trim() || 'Untitled Piece',
        category,
      });

      // Reset and notify success
      setPhotoUri(null);
      setName('');
      setCategory(null);
      setIsUploading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      if (err instanceof ApiError && err.upgrade) {
        onClose();
        onUpgrade();
      } else {
        setErrorMessage(getUserFriendlyErrorMessage(err, 'Upload Item'));
      }
    }
  };

  const isFormValid = Boolean(photoUri && category);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent={true} // B3: Overlay covers status bar completely
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Fixed Sticky Header */}
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Add to Closet</Text>
              <Text style={styles.subtitle}>Upload your piece to get color matches</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={COLORS.obsidian} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Photo Selection / Preview at the very top */}
            {photoUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => setPhotoUri(null)}
                >
                  <Text style={styles.retakeText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pickerBox}>
                <Text style={styles.pickerHint}>Take or select a photo of your item</Text>
                <View style={styles.pickerRow}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => pickImage(true)}
                    activeOpacity={0.8}
                  >
                    <Camera size={20} color={COLORS.obsidian} />
                    <Text style={styles.pickerButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => pickImage(false)}
                    activeOpacity={0.8}
                  >
                    <ImageIcon size={20} color={COLORS.obsidian} />
                    <Text style={styles.pickerButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Item Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Navy Linen Shirt, Camel Coat..."
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.inputLabel}>Select Clothing Category</Text>
                {!category && (
                  <Text style={styles.requiredNotice}>(Required)</Text>
                )}
              </View>
              {Object.entries(CATEGORY_GROUPS_MAP).map(([groupKey, group]) => (
                <View key={groupKey} style={styles.categorySection}>
                  <Text style={styles.categoryGroupTitle}>{group.title}</Text>
                  <View style={styles.chipGrid}>
                    {group.categories.map((c) => {
                      const isSelected = category === c.value;
                      return (
                        <TouchableOpacity
                          key={c.value}
                          activeOpacity={0.8}
                          onPress={() => setCategory(c.value)}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}
                          >
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Error Message with user-friendly formatting */}
            {errorMessage ? (
              <ErrorBanner
                error={errorMessage}
                onDismiss={() => setErrorMessage('')}
              />
            ) : null}

            {/* User-facing color detection copy (C1: No developer jargon) */}
            <View style={styles.infoNotice}>
              <Sparkles size={16} color={COLORS.accent} />
              <Text style={styles.infoNoticeText}>
                We'll automatically detect your piece's main color.
              </Text>
            </View>

            {/* Submit Button (C2: Disabled until both photo & category are selected) */}
            <Button
              title={
                isUploading
                  ? 'Analyzing & Uploading…'
                  : !photoUri
                  ? 'Pick a Photo First'
                  : !category
                  ? 'Select a Category'
                  : 'Add to Closet'
              }
              onPress={handleUpload}
              loading={isUploading}
              disabled={!isFormValid || isUploading}
              size="lg"
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // B3: Solid dark backdrop covering everything
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.obsidian,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  pickerBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.canvas,
    marginBottom: 20,
  },
  pickerHint: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 44, // 44dp tap target
  },
  pickerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.obsidian,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: COLORS.cardMuted,
  },
  retakeButton: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardMuted,
    borderRadius: 9999,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.obsidian,
  },
  inputGroup: {
    marginBottom: 20,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.obsidian,
  },
  requiredNotice: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14.5,
    color: COLORS.obsidian,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 9999,
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 42, // Tap target
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: COLORS.obsidian,
    borderColor: COLORS.obsidian,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoNoticeText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 4,
    minHeight: 50,
  },
});
