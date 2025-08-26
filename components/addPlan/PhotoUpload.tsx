import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ImageFileInfo } from '../../hooks/useAddPlanScreen';

type Props = {
  onPhotoUpload: (files: ImageFileInfo[]) => void;
  onPhotoRemove: () => void;
  selectedFiles: ImageFileInfo[];
};

const PhotoUpload: React.FC<Props> = ({ onPhotoUpload, onPhotoRemove, selectedFiles }) => {
  const [selectedImages, setSelectedImages] = useState<ImageFileInfo[]>(selectedFiles);

  // selectedFiles prop이 변경될 때마다 로컬 state 업데이트
  useEffect(() => {
    setSelectedImages(selectedFiles);
  }, [selectedFiles]);

  const pickImage = async () => {
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 편집 비활성화로 여러 개 선택 가능하게
        allowsMultipleSelection: true,
        selectionLimit: 5, // 최대 5개까지 선택 가능
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageFiles: ImageFileInfo[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
          size: asset.fileSize
        }));
        
        // 기존 이미지와 새로 선택된 이미지 합치기
        const updatedImages = [...selectedImages, ...imageFiles];
        setSelectedImages(updatedImages);
        console.log('선택된 이미지 파일들:', updatedImages);
        // 이미지 선택 후 formData에 저장
        onPhotoUpload(updatedImages);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };



  const handleRemovePhoto = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    onPhotoUpload(newImages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사진 추가</Text>
      
      {/* 선택된 이미지 미리보기 */}
      <View style={styles.imagePreviewContainer}>
        <Text style={styles.previewTitle}>
          {selectedImages.length > 0 
            ? `선택된 사진 (${selectedImages.length}장)` 
            : '사진을 선택해주세요'
          }
        </Text>
        
        {selectedImages.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageScrollContainer}
            style={styles.scrollView}
          >
            {selectedImages.map((imageFile, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image 
                  source={{ uri: imageFile.uri }} 
                  style={styles.previewImage} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>사진을 추가하면 여기에 표시됩니다</Text>
          </View>
        )}
      </View>
      
      {/* 사진 추가 버튼 */}
              <TouchableOpacity 
          style={styles.addPhotoBtn} 
          onPress={pickImage}
        >
          <Ionicons name="images-outline" size={24} color="#666" />
          <Text style={styles.addPhotoText}>사진 여러장 선택</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          최대 5장까지 선택 가능합니다. 기존 사진에 추가로 선택할 수 있습니다.
        </Text>
        <Text style={styles.helpText}>
          첫 번째 사진은 일정 조회 시 썸네일로 사용됩니다
        </Text>
    </View>
  );
};

export default PhotoUpload;

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  imageScrollContainer: {
    paddingRight: 20,
    paddingLeft: 4,
  },
  scrollView: {
    maxHeight: 220,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  imagePreview: {
    position: 'relative',
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    width: 280,
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  previewImage: {
    width: 280,
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#6C5CE7',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addPhotoBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#e9ecef',
  },
  addPhotoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
