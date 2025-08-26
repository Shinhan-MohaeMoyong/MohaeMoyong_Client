import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SERVER_URL, getToken } from '../../constants/server';
import { useUser } from '../../contexts/UserContext';
import type { CommentRequestEntity } from '../../types/entity/CommentRequestEntity';
import type { PhotoUploadEntity } from '../../types/entity/PhotoUploadEntity';

type Props = {
  onFocusExpand?: () => void;
  planId?: number;
  onCommentSent?: () => void;
};

const CommentInput: React.FC<Props> = ({ onFocusExpand, planId, onCommentSent }) => {
  const { loggedUser } = useUser();
  const BSInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<PhotoUploadEntity | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  

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
        aspect: [1, 1],
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
      const token = await getToken();
      
      // API 요청
      const response = await fetch(`${SERVER_URL}/api/v1/uploads/media/direct`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          //'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const result: PhotoUploadEntity = await response.json();
        console.log('이미지 업로드 성공:', result);
        setUploadedPhoto(result); // 업로드된 사진 정보 저장
      } else {
        const errorData = await response.json();
        console.error('이미지 업로드 실패:', errorData);
        Alert.alert('업로드 실패', '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      Alert.alert('오류', '이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const sendComment = async () => {
    if (!planId) {
      Alert.alert('오류', '일정 ID가 없습니다.');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('오류', '댓글 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSending(true);
      
      // CommentRequestEntity 생성
      const commentRequest: CommentRequestEntity = {
        content: commentText.trim(),
        photos: uploadedPhoto ? [
          {
            url: uploadedPhoto.url,
            orderNo: 0
          }
        ] : []
      };

      console.log('💬 === 댓글 전송 요청 ===');
      console.log('일정 ID:', planId);
      console.log('댓글 데이터:', JSON.stringify(commentRequest, null, 2));
      
      // API 요청
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentRequest),
      });

      if (response.ok) {
        console.log('💬 === 댓글 전송 성공 ===');
        Alert.alert('성공', '댓글이 등록되었습니다.');
        
        // 입력 필드 초기화
        setCommentText('');
        setSelectedImage(null);
        setUploadedPhoto(null);
        
        // 부모 컴포넌트에 댓글 전송 완료 알림
        onCommentSent?.();
      } else {
        const errorData = await response.json();
        console.error('댓글 전송 실패:', errorData);
        Alert.alert('전송 실패', '댓글 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('댓글 전송 오류:', error);
      Alert.alert('오류', '댓글 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <BSInput
        placeholder="댓글 작성"
        style={styles.input}
        value={commentText}
        onChangeText={setCommentText}
        onFocus={onFocusExpand}
        multiline={true}
        maxLength={500}
        textAlignVertical="center"
      />
      
      {/* 선택된 이미지 미리보기 */}
      {selectedImage && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity 
            style={styles.removeImageBtn}
            onPress={() => {
              setSelectedImage(null);
              setUploadedPhoto(null);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={[styles.imageBtn, isUploading && styles.imageBtnDisabled]} 
        onPress={pickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <Ionicons name="image-outline" size={20} color="#666" />
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.btn, isSending && styles.btnDisabled]} 
        onPress={sendComment}
        disabled={isSending}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CommentInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    marginRight: 8,
  },
  username: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  imageBtn: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#e0e0e0',
  },
  imagePreview: {
    position: 'relative',
    marginLeft: 8,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  btn: {
    backgroundColor: '#6C5CE7',
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
  }
});
