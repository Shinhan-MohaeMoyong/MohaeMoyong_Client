// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import React, { useEffect, useState } from "react";
// import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import type { ImageFileInfo } from "../../hooks/useAddPlanScreen";

// type Props = {
//   onPhotoUpload: (files: ImageFileInfo[]) => void;
//   onPhotoRemove: () => void;
//   selectedFiles: ImageFileInfo[];
// };

// const PhotoUpload: React.FC<Props> = ({ onPhotoUpload, onPhotoRemove, selectedFiles }) => {
//   const [selectedImages, setSelectedImages] = useState<ImageFileInfo[]>(selectedFiles);

//   // selectedFiles prop이 변경될 때마다 로컬 state 업데이트
//   useEffect(() => {
//     setSelectedImages(selectedFiles);
//   }, [selectedFiles]);

//   const pickImage = async () => {
//     try {
//       // 권한 요청
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
//         return;
//       }

//       // 이미지 선택
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false, // 편집 비활성화로 여러 개 선택 가능하게
//         allowsMultipleSelection: true,
//         selectionLimit: 5, // 최대 5개까지 선택 가능
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets.length > 0) {
//         const imageFiles: ImageFileInfo[] = result.assets.map((asset) => ({
//           uri: asset.uri,
//           type: asset.mimeType || "image/jpeg",
//           name: asset.fileName || `image_${Date.now()}.jpg`,
//           size: asset.fileSize,
//         }));

//         // 기존 이미지와 새로 선택된 이미지 합치기
//         const updatedImages = [...selectedImages, ...imageFiles];
//         setSelectedImages(updatedImages);
//         console.log("선택된 이미지 파일들:", updatedImages);
//         // 이미지 선택 후 formData에 저장
//         onPhotoUpload(updatedImages);
//       }
//     } catch (error) {
//       console.error("이미지 선택 오류:", error);
//       Alert.alert("오류", "이미지를 선택하는 중 오류가 발생했습니다.");
//     }
//   };

//   const handleRemovePhoto = (index: number) => {
//     const newImages = selectedImages.filter((_, i) => i !== index);
//     setSelectedImages(newImages);
//     onPhotoUpload(newImages);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>사진 추가</Text>

//       {/* 선택된 이미지 미리보기 */}
//       <View style={styles.imagePreviewContainer}>
//         <Text style={styles.previewTitle}>
//           {selectedImages.length > 0
//             ? `선택된 사진 (${selectedImages.length}장)`
//             : "사진을 선택해주세요"}
//         </Text>

//         {selectedImages.length > 0 ? (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.imageScrollContainer}
//             style={styles.scrollView}
//           >
//             {selectedImages.map((imageFile, index) => (
//               <View key={index} style={styles.imagePreview}>
//                 <Image
//                   source={{ uri: imageFile.uri }}
//                   style={styles.previewImage}
//                   resizeMode="cover"
//                 />
//                 <TouchableOpacity
//                   style={styles.removeImageBtn}
//                   onPress={() => handleRemovePhoto(index)}
//                 >
//                   <Ionicons name="close-circle" size={24} color="#FF3B30" />
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </ScrollView>
//         ) : (
//           <View style={styles.emptyState}>
//             <Ionicons name="images-outline" size={48} color="#ccc" />
//             <Text style={styles.emptyText}>사진을 추가하면 여기에 표시됩니다</Text>
//           </View>
//         )}
//       </View>

//       {/* 사진 추가 버튼 */}
//       <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImage}>
//         <Ionicons name="images-outline" size={24} color="#666" />
//         <Text style={styles.addPhotoText}>사진 여러장 선택</Text>
//       </TouchableOpacity>
//       <Text style={styles.helpText}>
//         최대 5장까지 선택 가능합니다. 기존 사진에 추가로 선택할 수 있습니다.
//       </Text>
//       <Text style={styles.helpText}>첫 번째 사진은 일정 조회 시 썸네일로 사용됩니다</Text>
//     </View>
//   );
// };

// export default PhotoUpload;

// const styles = StyleSheet.create({
//   container: {
//     marginVertical: 16,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#333",
//     marginBottom: 12,
//   },
//   imagePreviewContainer: {
//     marginBottom: 16,
//   },
//   previewTitle: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#666",
//     marginBottom: 8,
//   },
//   imageScrollContainer: {
//     paddingRight: 20,
//     paddingLeft: 4,
//   },
//   scrollView: {
//     maxHeight: 220,
//   },
//   emptyState: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: "#e9ecef",
//     borderStyle: "dashed",
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#999",
//     textAlign: "center",
//   },
//   imagePreview: {
//     position: "relative",
//     marginRight: 16,
//     borderRadius: 16,
//     overflow: "hidden",
//     width: 280,
//     height: 200,
//     backgroundColor: "#f0f0f0",
//   },
//   previewImage: {
//     width: 280,
//     height: 200,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: "#6C5CE7",
//   },
//   removeImageBtn: {
//     position: "absolute",
//     top: 8,
//     right: 8,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//     zIndex: 10,
//   },
//   addPhotoBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     backgroundColor: "#f8f9fa",
//     borderWidth: 2,
//     borderColor: "#6C5CE7",
//     borderStyle: "dashed",
//     borderRadius: 12,
//   },
//   addPhotoBtnDisabled: {
//     opacity: 0.5,
//     backgroundColor: "#e9ecef",
//   },
//   addPhotoText: {
//     marginLeft: 8,
//     fontSize: 16,
//     color: "#6C5CE7",
//     fontWeight: "500",
//   },
//   helpText: {
//     marginTop: 8,
//     fontSize: 12,
//     color: "#999",
//     textAlign: "center",
//     fontStyle: "italic",
//   },
// });
// // PhotoUpload (요약 버전: 핵심 UI만)
// import { Ionicons } from "@expo/vector-icons";
// import * as ImageManipulator from "expo-image-manipulator";
// import * as ImagePicker from "expo-image-picker";
// import { useCallback, useEffect, useState } from "react";
// import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import { v4 as uuid } from "uuid"; // 설치 가능하면 사용, 아니면 Date.now() 대체

// type ImageFileInfo = {
//   /* 위 확장 타입과 동일 */ id: string;
//   uri: string;
//   type: string;
//   name: string;
//   size?: number;
//   width?: number;
//   height?: number;
//   isCover?: boolean;
//   progress?: number;
//   status?: "idle" | "uploading" | "done" | "error";
//   caption?: string;
// };

// type Props = {
//   selectedFiles: ImageFileInfo[];
//   onPhotoUpload: (files: ImageFileInfo[]) => void;
// };

// export default function PhotoUpload({ selectedFiles, onPhotoUpload }: Props) {
//   const [images, setImages] = useState<ImageFileInfo[]>(selectedFiles ?? []);

//   useEffect(() => setImages(selectedFiles ?? []), [selectedFiles]);

//   const MAX = 10;

//   const pickFromLibrary = useCallback(async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") return Alert.alert("권한 필요", "사진 접근 권한을 허용해주세요.");
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsMultipleSelection: true,
//       selectionLimit: Math.max(1, MAX - images.length),
//       quality: 1,
//     });
//     if (result.canceled) return;

//     // 전처리(회전/압축/변환)
//     const processed: ImageFileInfo[] = [];
//     for (const asset of result.assets) {
//       const manip = await ImageManipulator.manipulateAsync(
//         asset.uri,
//         [{ resize: { width: 1600 } }], // 긴 변 1600px
//         { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
//       );
//       processed.push({
//         id: uuid?.() ?? String(Date.now() + Math.random()),
//         uri: manip.uri,
//         type: "image/jpeg",
//         name: `image_${Date.now()}.jpg`,
//         size: undefined,
//         width: manip.width,
//         height: manip.height,
//         isCover: false,
//         progress: 0,
//         status: "idle",
//       });
//     }
//     const updated = [...images, ...processed].slice(0, MAX);
//     if (updated.length > 0 && !updated.some((i) => i.isCover)) {
//       updated[0].isCover = true; // 첫 장을 커버로
//     }
//     setImages(updated);
//     onPhotoUpload(updated);
//   }, [images, onPhotoUpload]);

//   const takePhoto = useCallback(async () => {
//     const { status } = await ImagePicker.requestCameraPermissionsAsync();
//     if (status !== "granted") return Alert.alert("권한 필요", "카메라 권한을 허용해주세요.");
//     const result = await ImagePicker.launchCameraAsync({ quality: 1 });
//     if (result.canceled) return;
//     const asset = result.assets[0];

//     const manip = await ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: 1600 } }], {
//       compress: 0.8,
//       format: ImageManipulator.SaveFormat.JPEG,
//     });
//     const newImg: ImageFileInfo = {
//       id: uuid?.() ?? String(Date.now() + Math.random()),
//       uri: manip.uri,
//       type: "image/jpeg",
//       name: `image_${Date.now()}.jpg`,
//       width: manip.width,
//       height: manip.height,
//       isCover: images.length === 0, // 첫 장이면 커버
//       progress: 0,
//       status: "idle",
//     };
//     const updated = [...images, newImg].slice(0, MAX);
//     setImages(updated);
//     onPhotoUpload(updated);
//   }, [images, onPhotoUpload]);

//   const setCover = useCallback(
//     (id: string) => {
//       const updated = images.map((img) => ({ ...img, isCover: img.id === id }));
//       setImages(updated);
//       onPhotoUpload(updated);
//     },
//     [images, onPhotoUpload]
//   );

//   const removeAt = useCallback(
//     (id: string) => {
//       const updated = images.filter((i) => i.id !== id);
//       // 커버가 사라졌으면 첫 장을 커버로
//       if (updated.length > 0 && !updated.some((i) => i.isCover)) updated[0].isCover = true;
//       setImages(updated);
//       onPhotoUpload(updated);
//     },
//     [images, onPhotoUpload]
//   );

//   // 간단 재정렬: 좌/우 이동 버튼(드래그 대신)
//   const move = useCallback(
//     (index: number, dir: -1 | 1) => {
//       const target = index + dir;
//       if (target < 0 || target >= images.length) return;
//       const arr = [...images];
//       [arr[index], arr[target]] = [arr[target], arr[index]];
//       setImages(arr);
//       onPhotoUpload(arr);
//     },
//     [images, onPhotoUpload]
//   );

//   const renderItem = ({ item, index }: { item: ImageFileInfo; index: number }) => (
//     <View style={styles.tile}>
//       <Image source={{ uri: item.uri }} style={styles.image} />
//       {/* 커버 배지/토글 */}
//       <TouchableOpacity
//         style={[styles.coverBadge, item.isCover && styles.coverBadgeActive]}
//         onPress={() => setCover(item.id)}
//       >
//         <Ionicons name="star" size={14} color={item.isCover ? "#fff" : "#6C5CE7"} />
//         <Text style={[styles.coverText, item.isCover && { color: "#fff" }]}>
//           {item.isCover ? "대표" : "대표로"}
//         </Text>
//       </TouchableOpacity>

//       {/* 삭제 */}
//       <TouchableOpacity style={styles.removeBtn} onPress={() => removeAt(item.id)}>
//         <Ionicons name="close-circle" size={22} color="#FF3B30" />
//       </TouchableOpacity>

//       {/* 순서 이동 */}
//       <View style={styles.orderBtns}>
//         <TouchableOpacity onPress={() => move(index, -1)} disabled={index === 0}>
//           <Ionicons name="chevron-back-circle" size={22} color={index === 0 ? "#ccc" : "#666"} />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={() => move(index, +1)} disabled={index === images.length - 1}>
//           <Ionicons
//             name="chevron-forward-circle"
//             size={22}
//             color={index === images.length - 1 ? "#ccc" : "#666"}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.wrap}>
//       <Text style={styles.title}>사진</Text>

//       {/* 액션 바: 앨범/카메라/개수 표시 */}
//       <View style={styles.actions}>
//         <TouchableOpacity style={styles.actionBtn} onPress={pickFromLibrary}>
//           <Ionicons name="images-outline" size={18} color="#6C5CE7" />
//           <Text style={styles.actionText}>앨범에서 선택</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.actionBtn} onPress={takePhoto}>
//           <Ionicons name="camera-outline" size={18} color="#6C5CE7" />
//           <Text style={styles.actionText}>카메라</Text>
//         </TouchableOpacity>
//         <Text style={styles.countText}>
//           {images.length}/{MAX}
//         </Text>
//       </View>

//       {/* 그리드 */}
//       {images.length === 0 ? (
//         <View style={styles.empty}>
//           <Ionicons name="images-outline" size={48} color="#ccc" />
//           <Text style={styles.emptyText}>사진을 추가하세요. 첫 사진이 기본 대표가 됩니다.</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={images}
//           keyExtractor={(i) => i.id}
//           numColumns={3}
//           columnWrapperStyle={{ gap: 10 }}
//           contentContainerStyle={{ gap: 10 }}
//           renderItem={renderItem}
//         />
//       )}

//       <Text style={styles.help}>
//         • 업로드 전 자동 압축/회전 보정 • 커버(대표) 지정 가능 • 길게 눌러 삭제 확인 옵션 추천
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrap: { marginVertical: 16 },
//   title: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },

//   actions: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
//   actionBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: "#EEF1FF",
//     borderWidth: 1,
//     borderColor: "#DDE2FF",
//   },
//   actionText: { color: "#6C5CE7", fontWeight: "700" },
//   countText: { marginLeft: "auto", color: "#666", fontSize: 12 },

//   empty: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//     backgroundColor: "#f8f9fa",
//     borderRadius: 16,
//     borderWidth: 2,
//     borderColor: "#e9ecef",
//     borderStyle: "dashed",
//   },
//   emptyText: { marginTop: 8, color: "#999", fontSize: 13 },

//   tile: {
//     flex: 1,
//     aspectRatio: 1,
//     borderRadius: 12,
//     overflow: "hidden",
//     backgroundColor: "#f0f0f0",
//     position: "relative",
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   image: { width: "100%", height: "100%" },

//   coverBadge: {
//     position: "absolute",
//     left: 6,
//     top: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: "#fff",
//     borderRadius: 999,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderWidth: 1,
//     borderColor: "#6C5CE7",
//   },
//   coverBadgeActive: { backgroundColor: "#6C5CE7" },
//   coverText: { fontSize: 11, color: "#6C5CE7", fontWeight: "700" },

//   removeBtn: { position: "absolute", right: 6, top: 6, backgroundColor: "#fff", borderRadius: 999 },

//   orderBtns: {
//     position: "absolute",
//     right: 6,
//     bottom: 6,
//     flexDirection: "row",
//     gap: 4,
//     backgroundColor: "rgba(255,255,255,0.9)",
//     borderRadius: 999,
//     paddingHorizontal: 6,
//     paddingVertical: 4,
//   },

//   help: { marginTop: 8, color: "#999", fontSize: 12 },
// });
