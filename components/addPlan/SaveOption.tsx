import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type AccountInfo = {
  bankName: string;
  accountNumber: string;
};

type Props = {
  isEnabled: boolean;
  onToggle: () => void;
  withdrawalAccount?: AccountInfo | null;
  depositAccount?: AccountInfo | null;
  savingAmount: string; // 숫자만 저장된 문자열 (예: "10000")
  onWithdrawalAccountSelect: () => void;
  onDepositAccountSelect: () => void;
  onSavingAmountChange: (amount: string) => void; // 숫자만 넘김
};

// 천단위 콤마 포맷
const formatCurrency = (value: string) => {
  if (!value) return "";
  const numeric = value.replace(/[^0-9]/g, "");
  if (!numeric) return "";
  return Number(numeric).toLocaleString("ko-KR");
};

// 계좌번호 구간별 마스킹: ***-***-9012
const maskAccountNumber = (accountNumber?: string, visibleDigits: number = 4) => {
  if (!accountNumber) return "";
  const parts = accountNumber.split("-");
  return parts
    .map((part, idx) => {
      if (idx === parts.length - 1) {
        if (part.length <= visibleDigits) return part;
        return part.slice(0, part.length - visibleDigits).replace(/[0-9]/g, "*")
          + part.slice(part.length - visibleDigits);
      }
      return part.replace(/[0-9]/g, "*");
    })
    .join("-");
};

export default function SaveOption({
  isEnabled,
  onToggle,
  withdrawalAccount,
  depositAccount,
  savingAmount,
  onWithdrawalAccountSelect,
  onDepositAccountSelect,
  onSavingAmountChange,
}: Props) {
  // 입력 시: 숫자만 상위로 전달 → 화면에는 콤마 포함 문자열 표시
  const handleAmountChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, "");
    onSavingAmountChange(numeric);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>저축하기</Text>
        <TouchableOpacity style={styles.toggleContainer} onPress={onToggle} activeOpacity={0.8}>
          <View style={[styles.toggleSwitch, isEnabled && styles.toggleSwitchActive]}>
            <View style={[styles.toggleKnob, isEnabled && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {isEnabled && (
        <View style={styles.settingsContainer}>
          {/* 출금 계좌 (필요 시 주석 해제)
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>출금계좌</Text>
            <TouchableOpacity style={styles.accountSelector} onPress={onWithdrawalAccountSelect} activeOpacity={0.85}>
              {withdrawalAccount ? (
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{withdrawalAccount.bankName}</Text>
                  <Text style={styles.accountNumber}>{withdrawalAccount.accountNumber}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>선택해주세요</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          */}

          {/* 입금 계좌 (번호 마스킹 표시) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>입금계좌</Text>
            <TouchableOpacity style={styles.accountSelector} onPress={onDepositAccountSelect} activeOpacity={0.85}>
              {depositAccount ? (
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{depositAccount.bankName}</Text>
                  <Text style={styles.accountNumber}>
                    {maskAccountNumber(depositAccount.accountNumber, 4)}
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>선택해주세요</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* 저축 금액 (천단위 콤마 표시) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>저축 금액</Text>
            <View style={styles.amountContainer}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <TextInput
                style={styles.amountInput}
                value={formatCurrency(savingAmount)}     // 포맷된 값 표시
                onChangeText={handleAmountChange}        // 숫자만 상위로 전달
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
                inputMode="numeric"
              />
              <Text style={styles.currencyText}>원</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#6C5CE7",
    borderRadius: 12,
    padding: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  toggleContainer: { padding: 4 },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    position: "relative",
    padding: 2,
  },
  toggleSwitchActive: { backgroundColor: "#FF6B9D" },
  toggleKnob: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff",
    position: "absolute", top: 2, left: 2,
  },
  toggleKnobActive: { left: 22 },

  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  fieldContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 16, fontWeight: "600", color: "#333",
    marginBottom: 8,
  },

  accountSelector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: "#e0e0e0",
  },
  accountInfo: { flex: 1 },
  bankName: { fontSize: 16, color: "#666", marginBottom: 2 },
  accountNumber: { fontSize: 14, color: "#999" },
  placeholderText: { fontSize: 16, color: "#999" },

  amountContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFF9C4",
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: "#FFD54F",
  },
  amountInput: {
    flex: 1, fontSize: 18, fontWeight: "700", color: "#333",
    marginLeft: 12, marginRight: 8,
  },
  currencyText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
