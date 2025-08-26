import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SERVER_URL, getToken } from '../../constants/server';
import type { PhotoUploadEntity } from '../../types/entity/PhotoUploadEntity';

type Props = {
  onPhotoUpload: (photo: PhotoUploadEntity) => void;
  onPhotoRemove: () => void;
  uploadedPhoto: PhotoUploadEntity | null;
};

const PhotoUpload: React.FC<Props> = ({ onPhotoUpload, onPhotoRemove, uploadedPhoto }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        allowsEditing: true,
        aspect: [16, 9], // 가로형 비율로 설정
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        console.log('선택된 이미지:', result.assets[0].uri);
        // 이미지 선택 후 자동으로 업로드
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: image.mimeType,
        name: image.fileName
      } as any);

      // 토큰 가져오기
      const token = getToken();
      
      // API 요청
      const response = await fetch(`${SERVER_URL}/api/v1/uploads/media/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result: PhotoUploadEntity = await response.json();
        console.log('이미지 업로드 성공:', result);
        onPhotoUpload(result); // 부모 컴포넌트에 업로드된 사진 정보 전달
        Alert.alert('성공', '이미지가 업로드되었습니다.');
      } else {
        const errorData = await response.json();
        console.error('이미지 업로드 실패:', errorData);
        Alert.alert('업로드 실패', '이미지 업로드에 실패했습니다.');
        setSelectedImage(null);
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
      setSelectedImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedImage(null);
    onPhotoRemove();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사진 추가</Text>
      
      {/* 선택된 이미지 미리보기 */}
      {(selectedImage || uploadedPhoto) && (
        <View style={styles.imagePreview}>
          <Image 
            source={{ uri: selectedImage || uploadedPhoto?.url }} 
            style={styles.previewImage} 
          />
          <TouchableOpacity 
            style={styles.removeImageBtn}
            onPress={handleRemovePhoto}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* 사진 추가 버튼 */}
      <TouchableOpacity 
        style={[styles.addPhotoBtn, isUploading && styles.addPhotoBtnDisabled]} 
        onPress={pickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <>
            <Ionicons name="camera-outline" size={24} color="#666" />
            <Text style={styles.addPhotoText}>사진 추가</Text>
          </>
        )}
      </TouchableOpacity>
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
  imagePreview: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
});
