import { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export interface ProductCardProps {
  productName: string;
  productDescription: string;
  bankName: string; // 예: "신한은행"
  /** (선택) 서버에서 내려주는 로고 URL이 있다면 사용 */
  bankLogoUrl?: string;
  /** 과거 텍스트 로고 호환용 (사용 안 해도 됨) */
  bankLogoText?: string;

  isExclusive?: boolean;
  exclusiveNote?: string;
  preferentialNote?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 🔹 은행명 → 로컬 에셋 매핑 (필요한 은행 추가하세요) */
const BANK_LOGOS: Record<string, ImageSourcePropType> = {
  신한은행: require("@/assets/images/shinhanlogo.png"),
  // "국민은행": require("@/assets/logos/kb.png"),
  // "우리은행": require("@/assets/logos/woori.png"),
};

const COLORS = {
  bg: "#FFFFFF",
  ink: "#0F172A",
  sub: "#475569",
  hint: "#94A3B8",
  border: "#E5E7EB",
  accent: "#8B5CF6",
  accentSoft: "#EDE9FE",
  chipIndigoBg: "#EEF2FF",
  chipIndigoFg: "#4F46E5",
  chipPurpleBg: "#F3E8FF",
  chipPurpleFg: "#7C3AED",
};

export default function ProductCard({
  productName,
  productDescription,
  bankName,
  bankLogoUrl,
  bankLogoText,
  isExclusive = false,
  exclusiveNote,
  preferentialNote,
  onPress,
  style,
}: ProductCardProps) {
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const openHelp = () => setShowDescriptionModal(true);
  const closeHelp = () => setShowDescriptionModal(false);

  // “신한은행” → “신한”
  const bankCoreName = useMemo(() => bankName.replace(/은행$/, ""), [bankName]);
  const monogram = useMemo(() => bankCoreName.slice(0, 2) || "은행", [bankCoreName]);

  /** ✅ 최종 로고 소스 결정: URL > 로컬 에셋 > 없음(모노그램 폴백) */
  const imageSource: ImageSourcePropType | null = useMemo(() => {
    if (bankLogoUrl) return { uri: bankLogoUrl };
    if (BANK_LOGOS[bankName]) return BANK_LOGOS[bankName];
    return null;
  }, [bankLogoUrl, bankName]);

  return (
    <>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: "rgba(139, 92, 246, 0.12)" }}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }, style]}
      >
        {/* 좌측 포인트 바 */}
        <View style={styles.leftBar} />

        {/* 내용 */}
        <View style={styles.content}>
          {/* 헤더: 로고 + 은행명 + (뱃지/도움말) */}
          <View style={styles.headerRow}>
            {/* ✅ 로고: 이미지 있으면 이미지, 없으면 모노그램/텍스트 */}
            <View
              style={[styles.logoWrap, imageSource ? styles.logoWrapImage : styles.logoWrapMono]}
            >
              {imageSource ? (
                <Image source={imageSource} style={styles.logoImage} resizeMode="contain" />
              ) : (
                <Text style={styles.logoMonoText} numberOfLines={1}>
                  {bankLogoText || monogram}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bankName} numberOfLines={1}>
                {bankName}
              </Text>
            </View>

            {isExclusive && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>EXCLUSIVE</Text>
              </View>
            )}

            
          </View>

          {/* 본문 */}
          <Text style={styles.title} numberOfLines={1}>
            {productName}
          </Text>
          {!!productDescription && (
            <Text style={styles.desc} numberOfLines={2}>
              {productDescription}
            </Text>
          )}

          {/* 칩 */}
          {(exclusiveNote || preferentialNote) && (
            <View style={styles.chipRow}>
              {!!exclusiveNote && (
                <View style={[styles.chip, { backgroundColor: COLORS.chipIndigoBg }]}>
                  <Text style={[styles.chipText, { color: COLORS.chipIndigoFg }]}>
                    {exclusiveNote}
                  </Text>
                </View>
              )}
              {!!preferentialNote && (
                <View style={[styles.chip, { backgroundColor: COLORS.chipPurpleBg }]}>
                  <Text style={[styles.chipText, { color: COLORS.chipPurpleFg }]}>
                    {preferentialNote}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* 하단 큐 */}
          <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                openHelp();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
            
          <View style={styles.bottomRow}>
            <Text style={styles.bottomHint}>자세히 보기</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          </TouchableOpacity>
        </View>
      </Pressable>

      {/* 상품설명 모달 */}
      <Modal
        visible={showDescriptionModal}
        transparent
        animationType="fade"
        onRequestClose={closeHelp}
      >
        {/* 바깥 영역 탭 → 닫힘 */}
        <Pressable style={styles.modalOverlay} onPress={closeHelp}>
          {/* 내용 카드 영역은 탭해도 닫히지 않도록 */}
          <Pressable style={styles.modalCardWrap} onPress={() => {}}>
            <View style={styles.modalHeaderRow}>
              {/* 좌측 로고/모노그램 (카드와 톤 맞춤) */}
              <View
                style={[styles.logoWrap, imageSource ? styles.logoWrapImage : styles.logoWrapMono]}
              >
                {imageSource ? (
                  <Image source={imageSource} style={styles.logoImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.logoMonoText} numberOfLines={1}>
                    {bankLogoText || monogram}
                  </Text>
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modalBankName} numberOfLines={1}>
                  {bankName}
                </Text>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {productName}
                </Text>
              </View>

              <TouchableOpacity onPress={closeHelp} style={styles.modalCloseBtn} hitSlop={8}>
                <Text style={styles.modalCloseBtnText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 구분선 */}
            <View style={styles.modalDivider} />

            {/* 본문 스크롤: 긴 설명 대응 */}
            <ScrollView
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              {!!productDescription && (
                <Text style={styles.modalDescription}>{productDescription}</Text>
              )}

              {(exclusiveNote || preferentialNote) && (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.modalSectionTitle}>상품 특징</Text>
                  {!!exclusiveNote && <Text style={styles.modalBullet}>• {exclusiveNote}</Text>}
                  {!!preferentialNote && (
                    <Text style={styles.modalBullet}>• {preferentialNote}</Text>
                  )}
                </View>
              )}

              <View style={{ marginTop: 16 }}>
                <Text style={styles.modalSectionTitle}>은행 정보</Text>
                <Text style={styles.modalBankText}>{bankName}</Text>
              </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={closeHelp}
                activeOpacity={0.9}
              >
                <Text style={styles.modalPrimaryBtnText}>확인</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    overflow: "hidden",
  },
  leftBar: {
    width: 6,
    backgroundColor: COLORS.accent,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  /** 로고 컨테이너 */
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  // 이미지 로고일 때: 흰 배경 + 테두리 (로고 가독성↑)
  logoWrapImage: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // 모노그램일 때: 브랜드 컬러 배경
  logoWrapMono: {
    backgroundColor: COLORS.accent,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoMonoText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  bankName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.sub,
  },
  badge: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accent,
  },
  helpGhost: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  helpGhostText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 16,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.ink,
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: COLORS.sub,
    marginBottom: 8,
    lineHeight: 19,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bottomHint: {
    fontSize: 12,
    color: COLORS.hint,
    marginRight: 4,
    fontWeight: "700",
  },
  chevron: {
    fontSize: 16,
    color: COLORS.accent,
  },

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)", // 살짝 블러 느낌의 딤
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCardWrap: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
  },

  // ── 헤더 ──────────────────────────────────────────────────
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalBankName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0B1220",
    lineHeight: 22,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  modalCloseBtnText: {
    fontSize: 24,
    lineHeight: 24,
    color: "#94A3B8",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  // ── 본문 ──────────────────────────────────────────────────
  modalDescription: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalBullet: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 4,
  },
  modalBankText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },

  // ── 푸터 ──────────────────────────────────────────────────
  modalFooter: {
    marginTop: 14,
  },
  modalPrimaryBtn: {
    backgroundColor: "#8C93FF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8C93FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  modalPrimaryBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
});
