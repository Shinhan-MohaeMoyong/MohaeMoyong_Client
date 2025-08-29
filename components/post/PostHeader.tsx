import { useUser } from "@/contexts/UserContext";
import type { PostBottomSheetDTO } from "@/types/dto/PostBottomSheetDTO";
import { Ionicons } from "@expo/vector-icons";
import { MapPin } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserProfile from "../ui/UserProfile";

type Props = {
  postData: PostBottomSheetDTO;
  onEdit?: () => void;
  onDelete?: () => void;
};

const PALETTE = {
  text: "#111827",
  sub: "#6b7280",
  line: "#E5E7EB",
  badge: "rgba(0,0,0,0.55)",
  chipBg: "#F2F4FF",
  chipFg: "#6C5CE7",
  white: "#FFFFFF",
};

const DEFAULT_RATIO = 3 / 2; // 가로:세로 비율 기본값(1.5)

function toRelativeTime(input?: string | number | Date): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "방금 전";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}일 전`;
  const w = Math.floor(day / 7);
  if (w < 5) return `${w}주 전`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}개월 전`;
  const y = Math.floor(day / 365);
  return `${y}년 전`;
}

type ImgItem = { url: string; ratio?: number };

export default function PostHeader({ postData, onEdit, onDelete }: Props) {
  const { loggedUser } = useUser();
  const [current, setCurrent] = useState(0);
  const [imgW, setImgW] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());

  // 이미지 리스트(대표 + 추가사진) + 비율 계산
  const images: ImgItem[] = useMemo(() => {
    const list: ImgItem[] = [];
    if (postData.imageUrl) list.push({ url: postData.imageUrl }); // 대표 이미지(비율 정보 없을 수 있음)
    if (postData.photos?.length) {
      const sorted = [...postData.photos].sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0));
      for (const p of sorted) {
        const ratio = p.width && p.height ? p.width / p.height : undefined;
        list.push({ url: p.url, ratio });
      }
    }
    return list;
  }, [postData.imageUrl, postData.photos]);

  const timeLabel = useMemo(() => {
    // @ts-ignore
    const createdAt = (postData as any).createdAt;
    // @ts-ignore
    const startTime = (postData as any).startTime;
    // @ts-ignore
    const updatedAt = (postData as any).updatedAt;
    return toRelativeTime(createdAt || startTime || updatedAt);
  }, [postData]);

  const currRatio = images[current]?.ratio ?? DEFAULT_RATIO;
  const imgH = imgW > 0 ? Math.round(imgW / currRatio) : 0;

  const handleMorePress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["취소", "수정", "삭제"], cancelButtonIndex: 0, destructiveButtonIndex: 2 },
        (idx) => { if (idx === 1) onEdit?.(); else if (idx === 2) handleDelete(); }
      );
    } else {
      Alert.alert("게시물 관리", "원하는 작업을 선택하세요", [
        { text: "취소", style: "cancel" },
        { text: "수정", onPress: () => onEdit?.() },
        { text: "삭제", style: "destructive", onPress: handleDelete },
      ]);
    }
  };

  const handleDelete = () => {
    Alert.alert("게시물 삭제", "정말로 이 게시물을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => onDelete?.() },
    ]);
  };

  const renderImage = ({ item, index }: { item: ImgItem; index: number }) =>
    errorSet.has(index) ? (
      <View style={[styles.image, { width: imgW, height: imgH }, styles.placeholder]}>
        <Ionicons name="image-outline" size={40} color="#9CA3AF" />
        <Text style={styles.placeholderText}>이미지를 불러오지 못했어요</Text>
      </View>
    ) : (
      <Image
        source={{ uri: item.url }}
        style={[styles.image, { width: imgW, height: imgH }]}
        resizeMode="cover"
        onError={() =>
          setErrorSet((prev) => {
            const next = new Set(prev);
            next.add(index);
            return next;
          })
        }
        accessibilityIgnoresInvertColors
      />
    );

  return (
    <View style={styles.card}>
      {/* 헤더 */}
      <View style={styles.headerRow}>
        <View style={styles.writer}>
          <UserProfile user={postData.authorDTO} size={36} showName={false} />
          <View>
            <Text style={styles.name}>{postData.authorDTO.name}</Text>
            {!!timeLabel && <Text style={styles.time}>{timeLabel}</Text>}
          </View>
        </View>
        {postData.authorDTO.id === loggedUser?.userId && (
          <TouchableOpacity onPress={handleMorePress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#111" />
          </TouchableOpacity>
        )}
      </View>

      {/* 제목 + 위치 (위) */}
      <View style={styles.metaBox}>
        <Text style={styles.title} numberOfLines={2}>
          {postData.title}
        </Text>
        {!!postData.place && (
          <View style={styles.placeChip}>
            <MapPin size={14} color={PALETTE.chipFg} />
            <Text style={styles.placeText} numberOfLines={1}>
              {postData.place}
            </Text>
          </View>
        )}
      </View>

      {/* 이미지(캐러셀, 비율 기반 높이) */}
      <View
        style={[styles.imageBox, imgH ? { height: imgH } : undefined]}
        onLayout={(e) => setImgW(e.nativeEvent.layout.width)}
      >
        {images.length > 0 ? (
          <>
            <FlatList
              data={images}
              keyExtractor={(_, i) => String(i)}
              renderItem={renderImage}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const idx = Math.round(imgW ? x / imgW : 0);
                if (idx !== current) setCurrent(idx);
              }}
            />
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>{`${current + 1}/${images.length}`}</Text>
            </View>
          </>
        ) : (
          <View style={[styles.image, { width: imgW, height: Math.round(imgW / DEFAULT_RATIO) }, styles.placeholder]}>
            <Ionicons name="image-outline" size={44} color="#9CA3AF" />
            <Text style={styles.placeholderText}>이미지를 추가해보세요!</Text>
          </View>
        )}
      </View>

      {/* 내용 (아래) */}
      {!!postData.content && (
        <View style={styles.contentBox}>
          <Text
            style={styles.content}
            numberOfLines={expanded ? undefined : 3}
            ellipsizeMode="tail"
          >
            {postData.content}
          </Text>
          {postData.content.length > 60 && (
            <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
              <Text style={styles.moreText}>{expanded ? "접기" : "더보기"}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 구분선 + 댓글 헤더 */}
      <View style={styles.sep} />
      <View style={styles.commentRow}>
        <Text style={styles.commentIcon}>💬</Text>
        <Text style={styles.commentLabel}>댓글</Text>
        <Text style={styles.commentCount}>{postData.commentCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PALETTE.white,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 6,
  },

  // 헤더
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  writer: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 16, fontWeight: "800", color: PALETTE.text },
  time: { fontSize: 12, color: PALETTE.sub, marginTop: 2 },

  // 제목+위치
  metaBox: {
    marginBottom: 10,
    paddingTop: 12,
    paddingLeft: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PALETTE.line,       // "#E5E7EB"
  },

  title: { fontSize: 20, fontWeight: "700", color: PALETTE.text },
  placeChip: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PALETTE.chipBg,
  },
  placeText: { fontSize: 10, color: PALETTE.chipFg, fontWeight: "600" },

  // 이미지
  imageBox: {
    width: "100%",
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      },
      android: { elevation: 2 },
    }),
  },
  image: { width: "100%", height: "100%" },
  placeholder: { alignItems: "center", justifyContent: "center", gap: 8 },
  placeholderText: { fontSize: 12, color: "#9CA3AF" },
  counterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: PALETTE.badge,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // 내용
  contentBox: { paddingVertical: 14,     paddingLeft: 4, },
  content: { fontSize: 17, color: "#111827", lineHeight: 22 },
  moreText: { marginTop: 6, fontSize: 12, fontWeight: "700", color: PALETTE.chipFg },

  // 댓글 헤더
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: PALETTE.line, marginTop: 8 },
  commentRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  commentIcon: { fontSize: 18 },
  commentLabel: { fontSize: 14, fontWeight: "700", color: PALETTE.text },
  commentCount: { fontSize: 14, fontWeight: "700", color: PALETTE.sub },
});
