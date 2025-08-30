import { getToken } from "@/contexts/tokenManager";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SERVER_URL } from "../../constants/server";
import { useUser } from "../../contexts/UserContext";
import type { CommentRequestEntity } from "../../types/entity/CommentRequestEntity";
import type { PhotoUploadEntity } from "../../types/entity/PhotoUploadEntity";

// 👉 lucide-react-native 아이콘 추가
import { Image as ImageIcon, Send, XCircle } from "lucide-react-native";

type Props = {
  onFocusExpand?: () => void;
  planId?: number;
  onCommentSent?: () => void;
};

const CommentInput: React.FC<Props> = ({ onFocusExpand, planId, onCommentSent }) => {
  const { loggedUser } = useUser();
  const BSInput = Platform.OS === "web" ? TextInput : BottomSheetTextInput;
  const [commentText, setCommentText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<PhotoUploadEntity | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error("이미지 선택 오류:", error);
      Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
    }
  };

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        type: image.mimeType,
        name: image.fileName,
      } as any);

      const token = await getToken();

      const response = await fetch(`${SERVER_URL}/api/v1/uploads/media/direct`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result: PhotoUploadEntity = await response.json();
        setUploadedPhoto(result);
      } else {
        const errorData = await response.json();
        console.error("이미지 업로드 실패:", errorData);
        Alert.alert("업로드 실패", "이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      Alert.alert("오류", "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const sendComment = async () => {
    if (!planId) {
      Alert.alert("오류", "일정 ID가 없습니다.");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("오류", "댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSending(true);

      const commentRequest: CommentRequestEntity = {
        content: commentText.trim(),
        photos: uploadedPhoto
          ? [
              {
                url: uploadedPhoto.url,
                orderNo: 0,
              },
            ]
          : [],
      };

      const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentRequest),
      });

      if (response.ok) {
        setCommentText("");
        setSelectedImage(null);
        setUploadedPhoto(null);
        onCommentSent?.();
      } else {
        const errorData = await response.json();
        console.error("댓글 전송 실패:", errorData);
        Alert.alert("전송 실패", "댓글 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 전송 오류:", error);
      Alert.alert("오류", "댓글 전송 중 오류가 발생했습니다.");
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
            <XCircle size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* 사진 버튼 */}
      <TouchableOpacity
        style={[styles.imageBtn, isUploading && styles.imageBtnDisabled]}
        onPress={pickImage}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <ImageIcon size={20} color="#666" />
        )}
      </TouchableOpacity>

      {/* 전송 버튼 */}
      <TouchableOpacity
        style={[styles.btn, isSending && styles.btnDisabled]}
        onPress={sendComment}
        disabled={isSending}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Send size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CommentInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 13, // ⬆️ 안쪽 여백도 키움
    minHeight: 44, // ⬆️ 기본 높이 넉넉하게
    maxHeight: 120, // ⬆️ 여러 줄 입력 가능
    fontSize: 15, // 글자 크기도 살짝 키움 (선택사항)
    textAlignVertical: "top", // 안드로이드에서 위쪽 정렬
  },
  imageBtn: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: "#e0e0e0",
  },
  imagePreview: {
    position: "relative",
    marginLeft: 8,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  btn: {
    backgroundColor: "#8C93FF",
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: "#999",
  },
});
