// components/addPlan/PhotoUpload.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image, // 설치 없이 기본 Image 유지 (문제 있으면 expo-image로 교체)
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ImageFileInfo as ParentImageFileInfo } from "../../hooks/useAddPlanScreen";

// 부모 타입에 id가 없을 수 있어서 확장(내부 렌더 안정용)
type ImageFileInfo = ParentImageFileInfo & { id?: string; isCover?: boolean };

type Props = {
  selectedFiles: ParentImageFileInfo[];
  onPhotoUpload: (files: ParentImageFileInfo[]) => void;
};

const makeId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export default function PhotoUpload({ selectedFiles, onPhotoUpload }: Props) {
  const [images, setImages] = useState<ImageFileInfo[]>(selectedFiles ?? []);
  const MAX = 5;

  // 부모 prop 변경 → 로컬 동기화
  useEffect(() => {
    // 누락된 id 채워두기 (FlatList key 안정화)
    const patched = (selectedFiles ?? []).map((it) => (it.id ? it : { ...it, id: makeId() }));
    setImages(patched as ImageFileInfo[]);
  }, [selectedFiles]);

  const ensureCover = (arr: ImageFileInfo[]) => {
    if (arr.length === 0) return arr;
    if (!arr.some((i) => i.isCover)) {
      const [f, ...r] = arr;
      return [{ ...f, isCover: true }, ...r];
    }
    return arr;
  };

  const syncUp = (arr: ImageFileInfo[]) => {
    const fixed = ensureCover(arr);
    setImages(fixed);
    // 부모 콜백으로 넘길 때는 원래 타입으로 캐스팅
    onPhotoUpload(fixed as ParentImageFileInfo[]);
  };

  const requestMediaPerm = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const pickFromLibrary = async () => {
    if (!(await requestMediaPerm())) return;

    const remain = Math.max(0, MAX - images.length);
    if (remain === 0) {
      Alert.alert("안내", `사진은 최대 ${MAX}장까지 업로드할 수 있어요.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remain,
      quality: 0.9, // 간단 압축만 (추가 라이브러리 없이)
    });
    if (result.canceled) return;

    // ➜ ImageManipulator 제거: asset 그대로 사용
    const picked: ImageFileInfo[] = result.assets.map((a) => ({
      id: makeId(),
      uri: a.uri,
      type: a.mimeType || "image/jpeg",
      name: a.fileName || `image_${Date.now()}.jpg`,
      size: a.fileSize,
      isCover: false,
    }));

    const updated = [...images, ...picked].slice(0, MAX);
    syncUp(updated);
  };

  const requestCameraPerm = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestCameraPerm())) return;
    if (images.length >= MAX) {
      Alert.alert("안내", `사진은 최대 ${MAX}장까지 업로드할 수 있어요.`);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (result.canceled) return;

    const a = result.assets[0];
    const newImg: ImageFileInfo = {
      id: makeId(),
      uri: a.uri,
      type: a.mimeType || "image/jpeg",
      name: a.fileName || `image_${Date.now()}.jpg`,
      size: a.fileSize,
      isCover: images.length === 0,
    };

    syncUp([...images, newImg].slice(0, MAX));
  };

  const setCover = (id: string) => {
    const updated = images.map((img) => ({ ...img, isCover: img.id === id }));
    syncUp(updated);
  };

  const removeAt = (id: string) => {
    const updated = images.filter((i) => i.id !== id);
    syncUp(updated);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const arr = [...images];
    [arr[index], arr[target]] = [arr[target], arr[index]];
    syncUp(arr);
  };

  const renderItem = ({ item, index }: { item: ImageFileInfo; index: number }) => (
    <View style={styles.tile}>
      <Image
        source={{ uri: item.uri }}
        style={styles.image}
        resizeMode="cover"
        onError={(e) => console.log("IMAGE ERROR:", item.uri, e.nativeEvent)}
      />
      <TouchableOpacity
        style={[styles.coverBadge, item.isCover && styles.coverBadgeActive]}
        onPress={() => item.id && setCover(item.id)}
      >
        <Ionicons name="star" size={14} color={item.isCover ? "#fff" : "#6C5CE7"} />
        <Text style={[styles.coverText, item.isCover && { color: "#fff" }]}>
          {item.isCover ? "대표" : "대표로"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.removeBtn} onPress={() => item.id && removeAt(item.id)}>
        <Ionicons name="close-circle" size={22} color="#FF3B30" />
      </TouchableOpacity>

      <View style={styles.orderBtns}>
        <TouchableOpacity onPress={() => move(index, -1)} disabled={index === 0}>
          <Ionicons name="chevron-back-circle" size={22} color={index === 0 ? "#ccc" : "#666"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => move(index, +1)} disabled={index === images.length - 1}>
          <Ionicons
            name="chevron-forward-circle"
            size={22}
            color={index === images.length - 1 ? "#ccc" : "#666"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>사진</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={pickFromLibrary}>
          <Ionicons name="images-outline" size={18} color="#6C5CE7" />
          <Text style={styles.actionText}>앨범에서 선택</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={18} color="#6C5CE7" />
          <Text style={styles.actionText}>카메라</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>
          {images.length}/{MAX}
        </Text>
      </View>

      {images.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="images-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>사진을 추가하세요. 첫 사진이 기본 대표가 됩니다.</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(i, idx) => i.id ?? i.uri ?? String(idx)} // ← 키 안전화
          numColumns={3}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10 }}
          renderItem={renderItem}
          // 부모가 ScrollView면 충돌 방지를 위해 끄는 게 안전
          // scrollEnabled={false}
        />
      )}

      <Text style={styles.help}>
        • 대표(커버) 지정 가능 • 좌/우 이동으로 순서 변경 • 최대 {MAX}장
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 16 },
  title: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },

  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EEF1FF",
    borderWidth: 1,
    borderColor: "#DDE2FF",
  },
  actionText: { color: "#6C5CE7", fontWeight: "700" },
  countText: { marginLeft: "auto", color: "#666", fontSize: 12 },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderStyle: "dashed",
  },
  emptyText: { marginTop: 8, color: "#999", fontSize: 13 },

  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: { width: "100%", height: "100%" },

  coverBadge: {
    position: "absolute",
    left: 6,
    top: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#6C5CE7",
  },
  coverBadgeActive: { backgroundColor: "#6C5CE7" },
  coverText: { fontSize: 11, color: "#6C5CE7", fontWeight: "700" },

  removeBtn: { position: "absolute", right: 6, top: 6, backgroundColor: "#fff", borderRadius: 999 },

  orderBtns: {
    position: "absolute",
    right: 6,
    bottom: 6,
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  help: { marginTop: 8, color: "#999", fontSize: 12 },
});
