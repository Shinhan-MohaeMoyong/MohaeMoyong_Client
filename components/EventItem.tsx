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
      {/* 왼쪽 시간 표시 영역 */}
      <View style={styles.timeContainer}>
        <Text style={styles.startTime}>{startTime}</Text>
        <Text style={styles.tildeSymbol}>~</Text>
        <Text style={styles.endTime}>{endTime}</Text>
      </View>

      {/* 오른쪽 일정 정보 영역 */}
      <View style={styles.eventContainer}>
        {/* 상단 행: 제목과 버튼들 */}
        <View style={styles.topRow}>
          <View style={styles.titleSection}>
            <Ionicons
              name="menu"
              size={16}
              color="white"
              style={styles.hamburgerIcon}
            />
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="remove" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={onComplete}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 행: 위치와 계좌 정보 */}
        <View style={styles.bottomRow}>
          <View style={styles.locationSection}>
            <Ionicons
              name="location"
              size={16}
              color="white"
              style={styles.locationIcon}
            />
            <Text style={styles.location}>{location}</Text>
          </View>
          {hasSavingsGoal && (
            <View style={styles.accountSection}>
              {withdrawalAccount ? (
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>출금:</Text>
                  <View style={styles.accountInfo}>
                    <Text style={styles.bankName}>{withdrawalAccount.bankName}</Text>
                    <Text style={styles.accountNumber}>{withdrawalAccount.accountNumber}</Text>
                  </View>
                </View>
              ) : onSelectWithdrawalAccount && (
                <TouchableOpacity 
                  style={styles.accountSelector}
                  onPress={onSelectWithdrawalAccount}
                >
                  <Text style={styles.placeholderText}>출금계좌 선택</Text>
                  <Ionicons name="chevron-down" size={16} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              )}
              {depositAccount ? (
                <View style={styles.accountItem}>
                  <Text style={styles.accountLabel}>입금:</Text>
                  <View style={styles.accountInfo}>
                    <Text style={styles.bankName}>{depositAccount.bankName}</Text>
                    <Text style={styles.accountNumber}>{depositAccount.accountNumber}</Text>
                  </View>
                </View>
              ) : onSelectDepositAccount && (
                <TouchableOpacity 
                  style={styles.accountSelector}
                  onPress={onSelectDepositAccount}
                >
                  <Text style={styles.placeholderText}>입금계좌 선택</Text>
                  <Ionicons name="chevron-down" size={16} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center", // flex-start에서 center로 변경
  },
  timeContainer: {
    width: 60,
    marginRight: 12,
    alignItems: "center", // flex-start에서 center로 변경
  },
  startTime: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8A6EEF",
    marginBottom: 2,
  },
  tildeSymbol: {
    fontSize: 20,
    color: "#666666",
    textAlign: "center",
    marginVertical: 2,
  },
  endTime: {
    fontSize: 20,
    color: "#666666",
  },
  eventContainer: {
    flex: 1,
    backgroundColor: "#8A6EEF",
    borderRadius: 12,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hamburgerIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  deleteButton: {
    width: 28,
    height: 28,
    backgroundColor: "#FF4757",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  completeButton: {
    width: 28,
    height: 28,
    backgroundColor: "#2ED573",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: "white",
  },
  accountSection: {
    alignItems: "flex-end",
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  accountLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
  },
  accountValue: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  selectAccountButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 2,
  },
  selectAccountText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  accountInfo: {
    alignItems: "flex-end",
  },
  bankName: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  accountNumber: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  accountSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 2,
  },
  placeholderText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
  },
});
