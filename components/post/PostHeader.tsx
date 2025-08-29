import { useUser } from "@/contexts/UserContext";
import type { PostBottomSheetDTO } from "@/types/dto/PostBottomSheetDTO";
import { Ionicons } from "@expo/vector-icons";
import { MapPin } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Platform, StyleSheet, Text, View } from "react-native";
import UserProfile from "../ui/UserProfile";

type Props = {
  postData: PostBottomSheetDTO;
};

const PALETTE = {
  text: "#111827",
  sub: "#6b7280",
  line: "#E5E7EB",
  cardInfo: "#E9E8FF",
  cardInfoDone: "#F5F5F5",
  descBg: "#F3F6FA",
  dot: "#D1D5DB",
  dotActive: "#6C5CE7",
  badge: "rgba(0,0,0,0.55)",
};

const IMAGE_HEIGHT = 200;

/** 간단한 상대시간 포맷터 */
function toRelativeTime(input?: string | number | Date): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const s = Math.floor(diffMs / 1000);
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

export default function PostHeader({ postData }: Props) {
  const { loggedUser } = useUser();
  const [current, setCurrent] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [errorSet, setErrorSet] = useState<Set<number>>(new Set());

  // 대표 이미지 + 추가 사진
  const images = useMemo(() => {
    const arr: string[] = [];
    if (postData.imageUrl) arr.push(postData.imageUrl);
    if (postData.photos?.length) arr.push(...postData.photos.map((p) => p.url));
    return arr;
  }, [postData.imageUrl, postData.photos]);

  const hasImages = images.length > 0;

  // time label: createdAt -> startTime -> updatedAt
  const timeLabel = useMemo(() => {
    // @ts-ignore
    const createdAt = (postData as any).createdAt;
    // @ts-ignore
    const startTime = (postData as any).startTime;
    // @ts-ignore
    const updatedAt = (postData as any).updatedAt;
    return toRelativeTime(createdAt || startTime || updatedAt);
  }, [postData]);

  useEffect(() => {
    // console.log('[PostHeader] postData : ', postData);
  }, [postData]);

  const renderPlaceholderCell = () => (
    <View style={[styles.postImage, styles.placeholderBox, { width: imageWidth || "100%" }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.placeholderLogo}
        resizeMode="contain"
      />
      <Text style={styles.placeholderText}>이미지를 추가해보세요!</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {/* 작성자 */}
      <View style={styles.headerRow}>
        <View style={styles.writerRow}>
          <UserProfile user={postData.authorDTO} size={40} showName={false} />
          <View>
            <Text style={styles.name}>{postData.authorDTO.name}</Text>
            {!!timeLabel && <Text style={styles.time}>{timeLabel}</Text>}
          </View>
        </View>

        {postData.authorDTO.id === loggedUser?.userId && (
          <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
        )}
      </View>

      {/* 본문 */}
      <View style={styles.contentRow}>
        {/* 왼쪽: 이미지/플레이스홀더 */}
        <View style={styles.leftCol}>
          <View style={styles.imageBox} onLayout={(e) => setImageWidth(e.nativeEvent.layout.width)}>
            {hasImages ? (
              <>
                <FlatList
                  data={images}
                  keyExtractor={(_, idx) => String(idx)}
                  renderItem={({ item, index }) =>
                    errorSet.has(index) ? (
                      renderPlaceholderCell()
                    ) : (
                      <Image
                        source={{ uri: item }}
                        style={[styles.postImage, { width: imageWidth }]}
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
                    )
                  }
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  nestedScrollEnabled
                  onMomentumScrollEnd={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const idx = Math.round(imageWidth > 0 ? x / imageWidth : 0);
                    if (idx !== current) setCurrent(idx);
                  }}
                />

                {images.length > 1 && (
                  <>
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>{`${current + 1}/${
                        images.length
                      }`}</Text>
                    </View>
                    <View style={styles.dotsRow}>
                      {images.map((_, i) => (
                        <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
                      ))}
                    </View>
                  </>
                )}
              </>
            ) : (
              renderPlaceholderCell()
            )}
          </View>
        </View>

        {/* 오른쪽: 일정 카드 + 설명 카드 */}
        <View style={styles.rightCol}>
          <View
            style={[
              styles.card,
              styles.cardInfo,
              postData.isCompleted && styles.cardInfoDone,
              styles.rightTop,
            ]}
          >
            {postData.isCompleted && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>종료된 일정</Text>
              </View>
            )}
            <Text
              style={[styles.cardTitle, postData.isCompleted && styles.cardTitleDone]}
              numberOfLines={2}
            >
              {postData.title}
            </Text>
            <View style={styles.placeRow}>
              <MapPin size={16} color={postData.isCompleted ? "#9CA3AF" : "#374151"} />
              <Text
                style={[styles.placeText, postData.isCompleted && styles.placeTextDone]}
                numberOfLines={1}
              >
                {postData.place}
              </Text>
            </View>
          </View>

          <View style={[styles.card, styles.descCard, styles.rightBottom]}>
            <Text style={styles.descText} numberOfLines={5}>
              {postData.content || "설명 없음"}
            </Text>
          </View>
        </View>
      </View>

      {/* 댓글 섹션 */}
      <View style={styles.commentHeader}>
        <View style={styles.separator} />
        {/* <View style={styles.commentRow}>
          <View style={styles.commentCenter}>
            <Text style={styles.commentLabel}>댓글</Text>
          </View>

          <View style={styles.commentCountRow}>
            <Text style={styles.commentEmoji}>💬</Text>
            <Text style={styles.commentCountText}>{postData.commentCount}</Text>
          </View>
        </View> */}
        <View style={styles.commentRow}>
          <Text style={styles.commentEmoji}>💬</Text>
          <Text style={styles.commentLabel}>댓글</Text>
          <Text style={styles.commentCountText}>{postData.commentCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8, gap: 10 },

  // 작성자 헤더
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  writerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontWeight: "700", fontSize: 14, color: PALETTE.text },
  time: { fontSize: 11, color: PALETTE.sub, marginTop: 2 },

  // 본문 (2열 고정)
  contentRow: { flexDirection: "row", gap: 12 },
  leftCol: { flex: 1.35 },
  rightCol: { flex: 1, gap: 12, height: IMAGE_HEIGHT }, // 오른쪽 전체 높이 고정

  // 이미지 컨테이너
  imageBox: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#eee",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  postImage: { width: "100%", height: IMAGE_HEIGHT, resizeMode: "cover" },

  // 플레이스홀더
  placeholderBox: {
    height: IMAGE_HEIGHT,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderLogo: { width: 72, height: 72, marginBottom: 8, opacity: 0.85 },
  placeholderText: { fontSize: 13, color: "#888" },

  // 캐러셀 보조 UI
  carouselBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: PALETTE.badge,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  carouselBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  dotsRow: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PALETTE.dot },
  dotActive: { backgroundColor: PALETTE.dotActive },

  // 카드
  card: {
    borderRadius: 14,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 1 },
    }),
  },
  cardInfo: { backgroundColor: PALETTE.cardInfo },
  cardInfoDone: { backgroundColor: PALETTE.cardInfoDone },
  doneBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doneBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: PALETTE.text, marginBottom: 8 },
  cardTitleDone: { color: "#9CA3AF" },

  placeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  placeText: { fontSize: 12, color: "#374151" },
  placeTextDone: { color: PALETTE.sub },

  // 오른쪽 상/하 비율
  rightTop: { flex: 0.55, justifyContent: "space-between" },
  rightBottom: { flex: 0.45 },

  // 설명 카드
  descCard: { backgroundColor: PALETTE.descBg },
  descText: { fontSize: 13, color: "#374151", lineHeight: 20 },

  // 댓글 헤더
  commentHeader: { marginTop: 12 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: PALETTE.line, marginBottom: 8 },

  commentRow: {
    flexDirection: "row", // 가로 배치
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  commentEmoji: { fontSize: 18 },
  commentLabel: { fontSize: 15, fontWeight: "600", color: PALETTE.text },
  commentCountText: { color: PALETTE.sub, fontSize: 15, fontWeight: "600" },
  commentCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },

  commentCountRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
    paddingRight: 0,
    paddingVertical: 4,
  },

  placeEmoji: { fontSize: 15, marginRight: 4 },
});
