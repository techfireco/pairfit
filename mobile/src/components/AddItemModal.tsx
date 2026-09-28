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
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { CATEGORY_GROUPS_MAP, CategoryValue } from '../types';
import { Button } from './Button';
import { uploadItemApi, ApiError } from '../api/client';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUpgrade: () => void;
}

export function AddItemModal({ visible, onClose, onSuccess, onUpgrade }: AddItemModalProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryValue>('tshirt');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage(err.message || 'Could not load photo');
    }
  };

  const handleUpload = async () => {
    if (!photoUri) {
      setErrorMessage('Please select or capture a clothing photo first.');
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

      // Reset and close
      setPhotoUri(null);
      setName('');
      setCategory('tshirt');
      setIsUploading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      if (err instanceof ApiError && err.upgrade) {
        onClose();
        onUpgrade();
      } else {
        setErrorMessage(err.message || 'Upload failed. Please try again.');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Add to Closet</Text>
              <Text style={styles.subtitle}>Upload your piece to get color matches</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={COLORS.obsidian} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Photo Selection / Preview */}
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
                  >
                    <Camera size={22} color={COLORS.obsidian} />
                    <Text style={styles.pickerButtonText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => pickImage(false)}
                  >
                    <ImageIcon size={22} color={COLORS.obsidian} />
                    <Text style={styles.pickerButtonText}>Choose from Gallery</Text>
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
              <Text style={styles.inputLabel}>Select Clothing Category</Text>
              {Object.entries(CATEGORY_GROUPS_MAP).map(([groupKey, group]) => (
                <View key={groupKey} style={styles.categorySection}>
                  <Text style={styles.categoryGroupTitle}>{group.title}</Text>
                  <View style={styles.chipGrid}>
                    {group.categories.map((c) => {
                      const isSelected = category === c.value;
                      return (
                        <TouchableOpacity
                          key={c.value}
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

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Sharp extraction notice */}
            <View style={styles.infoNotice}>
              <Sparkles size={14} color={COLORS.accent} />
              <Text style={styles.infoNoticeText}>
                Dominant color is automatically extracted with Sharp server-side.
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              title={isUploading ? 'Analyzing & Uploading…' : 'Add to Closet'}
              onPress={handleUpload}
              loading={isUploading}
              disabled={!photoUri || isUploading}
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
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    padding: 24,
    alignItems: 'center',
    backgroundColor: COLORS.canvas,
    marginBottom: 20,
  },
  pickerHint: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.card,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardMuted,
    borderRadius: 9999,
  },
  retakeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.obsidian,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.obsidian,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.obsidian,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryGroupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: COLORS.canvas,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.obsidian,
    borderColor: COLORS.obsidian,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 18,
  },
  infoNoticeText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 4,
  },
});
