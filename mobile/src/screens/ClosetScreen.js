import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import CategoryPicker from '../components/CategoryPicker';
import ItemCard from '../components/ItemCard';
import { addItem, deleteItem } from '../services/api';
import { theme } from '../styles/theme';

export default function ClosetScreen({
  closet,
  profile,
  onRefresh,
  refreshing,
  onItemAdded,
  onItemDeleted,
  onShowUpgradeModal,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tshirt');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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
        quality: 0.8,
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
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
        setErrorMsg('');
      }
    } catch (e) {
      setErrorMsg('Failed to launch camera');
    }
  };

  const handleAddItem = async () => {
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

      // Reset form
      setPhotoUri(null);
      setName('');
      setCategory('tshirt');
      setShowAddForm(false);
      onItemAdded(newItem);
    } catch (err) {
      if (err.upgrade || err.status === 402) {
        onShowUpgradeModal();
      } else {
        setErrorMsg(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteItem(id);
      onItemDeleted(id);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      {/* Plan Status Banner */}
      <View style={styles.planBanner}>
        <View style={styles.planIconRow}>
          <Ionicons
            name={profile?.isPro ? 'shield-checkmark' : 'information-circle'}
            size={18}
            color={profile?.isPro ? '#059669' : '#4B5563'}
          />
          <Text style={styles.planText}>
            {profile?.isPro
              ? 'Pro plan — unlimited items'
              : `${profile?.itemCount ?? closet.length} / ${profile?.itemLimit || 30} items (Free plan)`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.toggleAddBtn, showAddForm && styles.toggleAddBtnActive]}
          onPress={() => setShowAddForm(!showAddForm)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={showAddForm ? 'close' : 'add'}
            size={18}
            color={showAddForm ? theme.colors.text : '#FFFFFF'}
          />
          <Text style={[styles.toggleAddText, showAddForm && styles.toggleAddTextActive]}>
            {showAddForm ? 'Close' : 'Add Item'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Item Card */}
      {showAddForm && (
        <View style={styles.uploadCard}>
          <Text style={styles.sectionTitle}>Add Clothing Item</Text>

          {/* Photo Picker Options */}
          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => setPhotoUri(null)}
              >
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={takePhotoWithCamera}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImageFromGallery}
                activeOpacity={0.8}
              >
                <Ionicons name="images-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.photoButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name Field */}
          <Text style={styles.inputLabel}>Item Name (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Vintage Blue Denim Jacket"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          {/* Category Picker */}
          <CategoryPicker selected={category} onSelect={setCategory} />

          {/* Inline Error */}
          {errorMsg ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAddItem}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Analyzing & Extracting Colors…</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Add to Closet</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.wardrobeHeading}>
        My Wardrobe ({closet.length})
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={closet}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onDelete={handleDelete}
            isDeleting={deletingId === item.id}
          />
        )}
        ListEmptyComponent={
          !refreshing && (
            <View style={styles.emptyContainer}>
              <Ionicons name="shirt-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Your closet is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add your first clothing item above to start receiving color harmony recommendations.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  columnWrapper: {
    gap: 14,
  },
  headerArea: {
    marginBottom: 8,
  },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  planIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  planText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  toggleAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  toggleAddBtnActive: {
    backgroundColor: theme.colors.chipBg,
  },
  toggleAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleAddTextActive: {
    color: theme.colors.text,
  },
  uploadCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    marginBottom: 20,
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  photoButton: {
    flex: 1,
    height: 80,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 6,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  previewContainer: {
    width: '100%',
    height: 160,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    backgroundColor: '#EEEEEE',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.danger,
    fontWeight: '500',
  },
  submitBtn: {
    height: 46,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wardrobeHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    marginVertical: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
});
