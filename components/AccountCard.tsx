import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AccountDTO } from "../types/dto/AccountDTO";

interface AccountCardProps {
  account: AccountDTO;
  onPress: () => void;
  onAliasEdit?: () => void;
}
const BANK_LOGOS: Record<string, ImageSourcePropType> = {
  신한은행: require("@/assets/images/shinhanlogo.png"),
};

const formatCurrency = (n?: string | number) => {
  if (n === null || n === undefined) return "0";
  const num = typeof n === "string" ? Number(n.replace(/[^0-9.-]/g, "")) : n;
  return num.toLocaleString("ko-KR");
};

export default function AccountCard({
  account,
  onPress,
  onAliasEdit
}: AccountCardProps) {

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 왼쪽: 로고 */}
      <View style={styles.leftCol}>
        <View style={styles.bankLogo}>
          {BANK_LOGOS[account.bankName] ? (
            <Image
              source={BANK_LOGOS[account.bankName]}
              style={styles.bankLogoImg}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.bankLogoText}>{account.bankName?.charAt(0) ?? "?"}</Text>
          )}
        </View>
      </View>

      {/* 오른쪽 상단: 별칭 + 계좌번호 */}
      <View style={styles.rightCol}>
        {!!account.accountAlias && (
          <Text style={styles.accountAlias} numberOfLines={1}>
            {account.accountAlias}
          </Text>
        )}
        <Text style={styles.accountNumber} numberOfLines={1}>
          {account.maskedAccountNumber}
        </Text>
        
        {/* 잔액 */}
        <Text style={styles.balance}>
          {account.balance}
        </Text>
        
        {/* 계좌 별칭 */}
        <View style={styles.aliasContainer}>
          <Text style={styles.accountAlias}>
            {account.accountAlias}
          </Text>
          {onAliasEdit && (
            <TouchableOpacity
              style={styles.aliasEditButton}
              onPress={onAliasEdit}
            >
              <Text style={styles.aliasEditButtonText}>수정</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* 새 계좌 표시 */}
        {account.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>

      {/* 큰 금액: 카드 오른쪽-아래 고정 */}
      <Text style={styles.bigBalance} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {formatCurrency(account.balance)}원
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative", // ✅ 절대배치용
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    paddingRight: 20,
    paddingBottom: 25, // ✅ 큰 금액 공간 확보
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#EEF0F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    width: "100%",
    minHeight: 125, // ✅ 스케치 비율 확보
  },

  leftCol: { marginRight: 12 },
  bankLogo: {
    width: 53,
    height: 53,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EBFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bankLogoImg: { width: 50, height: 50 },
  bankLogoText: { fontSize: 16, color: "#6C5CE7", fontWeight: "800" },

  rightCol: { flex: 1, minWidth: 0 },
  accountAlias: { marginTop: 5, fontSize: 18, fontWeight: "800", color: "#111827" },
  accountNumber: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
    fontVariant: ["tabular-nums"],
    letterSpacing: 0.2,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  accountAlias: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  aliasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aliasEditButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  aliasEditButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',

  // 큰 금액
  bigBalance: {
    position: "absolute",
    right: 20,
    bottom: 14, // ✅ 카드 하단에 크게
    fontSize: 22, // 화면 좁으면 자동 축소(adjustsFontSizeToFit)
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.3,
    includeFontPadding: false,
  },

  newBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  newBadgeText: { color: "#7C3AED", fontSize: 10, fontWeight: "800", letterSpacing: 0.2 },
});
