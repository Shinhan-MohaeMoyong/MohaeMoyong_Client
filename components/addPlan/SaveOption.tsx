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
  savingAmount: string;
  onWithdrawalAccountSelect: () => void;
  onDepositAccountSelect: () => void;
  onSavingAmountChange: (amount: string) => void;
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
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>저축하기</Text>
        <TouchableOpacity style={styles.toggleContainer} onPress={onToggle}>
          <View style={[styles.toggleSwitch, isEnabled && styles.toggleSwitchActive]}>
            <View style={[styles.toggleKnob, isEnabled && styles.toggleKnobActive]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 저축 설정이 활성화되면 표시 */}
      {isEnabled && (
        <View style={styles.settingsContainer}>
          {/* 출금 계좌 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>출금계좌</Text>
            <TouchableOpacity style={styles.accountSelector} onPress={onWithdrawalAccountSelect}>
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

          {/* 입금 계좌 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>입금계좌</Text>
            <TouchableOpacity style={styles.accountSelector} onPress={onDepositAccountSelect}>
              {depositAccount ? (
                <View style={styles.accountInfo}>
                  <Text style={styles.bankName}>{depositAccount.bankName}</Text>
                  <Text style={styles.accountNumber}>{depositAccount.accountNumber}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>선택해주세요</Text>
              )}
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* 저축 금액 */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>저축 금액</Text>
            <View style={styles.amountContainer}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
              <TextInput
                style={styles.amountInput}
                value={savingAmount}
                onChangeText={onSavingAmountChange}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
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
  toggleContainer: {
    padding: 4,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    position: "relative",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#FF6B9D",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    position: "absolute",
    top: 2,
    left: 2,
  },
  toggleKnobActive: {
    left: 22,
  },

  // 저축 설정 컨테이너
  settingsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },

  // 필드 컨테이너
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },

  // 계좌 선택기
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  accountInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: "#999",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },

  // 금액 입력
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFD54F",
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 12,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
