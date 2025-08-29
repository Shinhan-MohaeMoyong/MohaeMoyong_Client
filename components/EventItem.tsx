import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AccountInfo = {
  bankName: string;
  accountNumber: string;
};

interface EventItemProps {
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  onDelete: () => void;
  onComplete: () => void;
  hasSavingsGoal?: boolean;
  withdrawalAccount?: AccountInfo | null;
  depositAccount?: AccountInfo | null;
  onSelectWithdrawalAccount?: () => void;
  onSelectDepositAccount?: () => void;
}

// --- 유틸: 계좌번호 구간별 마스킹 (***-***-9012) ---
const maskAccountNumber = (accountNumber: string, visibleDigits: number = 4) => {
  if (!accountNumber) return "";
  const parts = accountNumber.split("-");
  return parts
    .map((part, idx) => {
      if (idx === parts.length - 1) {
        if (part.length <= visibleDigits) return part;
        return (
          part.slice(0, part.length - visibleDigits).replace(/[0-9]/g, "*") +
          part.slice(part.length - visibleDigits)
        );
      }
      return part.replace(/[0-9]/g, "*");
    })
    .join("-");
};

export default function EventItem({
  startTime,
  endTime,
  title,
  location,
  onDelete,
  onComplete,
  hasSavingsGoal = false,
  withdrawalAccount,
  depositAccount,
  onSelectWithdrawalAccount,
  onSelectDepositAccount,
}: EventItemProps) {
  return (
    <View style={styles.container}>
      {/* 좌측 시간열: 카드와 같은 높이 + 위/아래 정렬 */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeTextPrimary}>{startTime}</Text>
        <Text style={styles.timeDash}>—</Text>
        <Text style={styles.timeTextSecondary}>{endTime}</Text>
      </View>

      {/* 카드 */}
      <View style={styles.card}>
        {/* 제목 + 액션 */}
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Ionicons
              name="reorder-three"
              size={18}
              color="#BFB3FF"
              style={styles.dragIcon}
            />
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.iconBtn, styles.deleteBtn]}
              onPress={onDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.completeBtn]}
              onPress={onComplete}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#0A2E16" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 위치 */}
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color="#DCD6FF"
            style={styles.locationIcon}
          />
        <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {/* 계좌 영역 */}
        {hasSavingsGoal && (
          <View style={styles.accountsWrap}>
            {/* 출금 */}
            {withdrawalAccount ? (
              <View style={styles.chipLarge}>
                <Text style={styles.chipLabelLarge}>출금</Text>
                <Text style={styles.chipTextLarge}>
                  {withdrawalAccount.bankName} {withdrawalAccount.accountNumber}
                </Text>
              </View>
            ) : onSelectWithdrawalAccount ? (
              <TouchableOpacity
                style={[styles.chipLarge, styles.chipGhost]}
                onPress={onSelectWithdrawalAccount}
                activeOpacity={0.85}
              >
                <Text style={styles.chipGhostTextLarge}>출금계좌 선택</Text>
                <Ionicons name="chevron-down" size={16} color="#CFC6FF" />
              </TouchableOpacity>
            ) : null}

            {/* 입금 */}
            {depositAccount ? (
              <View style={styles.chipLarge}>
                <Text style={styles.chipLabelLarge}>입금</Text>
                <Text style={styles.chipTextLarge}>
                  {depositAccount.bankName}{" "}
                  {maskAccountNumber(depositAccount.accountNumber, 4)}
                </Text>
              </View>
            ) : onSelectDepositAccount ? (
              <TouchableOpacity
                style={[styles.chipLarge, styles.chipGhost]}
                onPress={onSelectDepositAccount}
                activeOpacity={0.85}
              >
                <Text style={styles.chipGhostTextLarge}>입금계좌 선택</Text>
                <Ionicons name="chevron-down" size={16} color="#CFC6FF" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const PURPLE = "#8A6EEF";
const CARD_BG = "#6F58E6";
const CARD_PADDING_V = 14; // ↔ timeColumn과 카드 위/아래 패딩 일치

const styles = StyleSheet.create({
  /** 두 열이 같은 높이로 늘어나도록 */
  container: {
    flexDirection: "row",
    alignItems: "stretch", // ✅ 중요: 자식 높이를 서로 맞춤
    marginBottom: 14,
  },

  /** 시간열: 카드와 같은 상/하 패딩 + 공간 분배 */
  timeColumn: {
    width: 68,
    alignItems: "center",
    alignSelf: "stretch",
    paddingTop: CARD_PADDING_V,     // ✅ 카드와 동일
    paddingBottom: CARD_PADDING_V,  // ✅ 카드와 동일
    justifyContent: "space-between", // ✅ 시작은 맨 위, 끝은 맨 아래
  },
  timeTextPrimary: {
    fontSize: 18,
    fontWeight: "700",
    color: PURPLE,
  },
  timeDash: {
    fontSize: 16,
    lineHeight: 18,
    color: "#9AA1A9",
  },
  timeTextSecondary: {
    fontSize: 16,
    color: "#8C8F95",
  },

  /** 카드 */
  card: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: CARD_PADDING_V, // ↔ 시간열과 동일
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 24,
  },
  dragIcon: { marginRight: 6 },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: { backgroundColor: "#FF4757" },
  completeBtn: { backgroundColor: "#9CF6B3" },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  locationIcon: { marginRight: 6 },
  location: {
    flex: 1,
    fontSize: 13,
    color: "#EEE9FF",
  },

  /** 계좌 칩(더 크게) */
  accountsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
  },
  chipLarge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#7357E7",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  chipLabelLarge: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EDE7FF",
    marginRight: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  chipTextLarge: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  chipGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  chipGhostTextLarge: {
    fontSize: 14,
    color: "#EDE7FF",
    marginRight: 6,
  },
});
