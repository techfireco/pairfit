import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import CategoryPicker from '../components/CategoryPicker';
import { addItem } from '../services/api';
import { theme } from '../styles/theme';

export default function AddItemScreen({ onItemAdded, onCancel, onShowPaywall }) {
  const [photoUri, setPhotoUri] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tshirt');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access your photos is required.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setErrorMsg('');
      }
    } catch (e) {
      setErrorMsg('Failed to select photo');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to use the camera is required.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setErrorMsg('');
      }
    } catch (e) {
      setErrorMsg('Failed to launch camera');
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!photoUri) {
      setErrorMsg('Please select or capture a photo first.');
      return;
    }
    if (!category) {
      setErrorMsg('Please choose a category.');
      return;
    }

    setUploading(true);
    try {
      const newItem = await addItem({
        uri: photoUri,
        name: name.trim() || 'Untitled',
        category,
      });

      // Clear & navigate back
      setPhotoUri(null);
      setName('');
      setCategory('tshirt');
      onItemAdded(newItem);
    } catch (err) {
      if (err.upgrade || err.status === 402) {
        onShowPaywall();
      } else {
        setErrorMsg(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Add New Item</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Photo Selection Area */}
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={() => setPhotoUri(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse-outline" size={16} color="#FFFFFF" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Card style={styles.pickerBox}>
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera-outline" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.pickerTitle}>Add Clothing Photo</Text>
            <Text style={styles.pickerSubtitle}>
              Take a photo or choose an existing photo of your garment
            </Text>

            <View style={styles.actionRow}>
              <Button
                title="Camera"
                icon={<Ionicons name="camera" size={16} color="#FFFFFF" />}
                onPress={takePhotoWithCamera}
                size="md"
                style={styles.photoBtn}
              />
              <Button
                title="Gallery"
                icon={<Ionicons name="images" size={16} color={theme.colors.text} />}
                onPress={pickImageFromGallery}
                variant="outline"
                size="md"
                style={styles.photoBtn}
              />
            </View>
          </Card>
        )}

        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Input
            label="Garment Name"
            placeholder="e.g. Classic White Oxford Shirt"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <CategoryPicker selected={category} onSelect={setCategory} />

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Button
            title={uploading ? 'Analyzing Colors & Saving…' : 'Save to Wardrobe'}
            onPress={handleSave}
            loading={uploading}
            size="lg"
            style={styles.saveBtn}
          />
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
  content: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  screenTitle: {
    fontSize: theme.typography.xl.fontSize,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  cancelBtn: {
    padding: theme.spacing[2],
  },
  cancelText: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  pickerBox: {
    padding: theme.spacing[6],
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FAFAFA',
    marginBottom: theme.spacing[4],
  },
  cameraIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[3],
  },
  pickerTitle: {
    fontSize: theme.typography.md.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  pickerSubtitle: {
    fontSize: theme.typography.sm.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    maxWidth: 260,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  photoBtn: {
    flex: 1,
  },
  previewContainer: {
    width: '100%',
    height: 240,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: theme.spacing[4],
    backgroundColor: '#ECECEC',
    ...theme.shadows.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: theme.typography.xs.fontSize,
    fontWeight: '700',
  },
  formCard: {
    padding: theme.spacing[4],
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.dangerBg,
    padding: theme.spacing[2],
    borderRadius: theme.radius.md,
    marginVertical: theme.spacing[2],
  },
  errorText: {
    fontSize: theme.typography.xs.fontSize,
    color: theme.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  saveBtn: {
    marginTop: theme.spacing[3],
  },
});
