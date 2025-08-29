// components/GroupScheduleExample.tsx
import { useGroupScheduleSelection } from "@/hooks/useGroupScheduleSelection";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GroupScheduleSelectionScreen from "./GroupScheduleSelectionScreen";

export default function GroupScheduleExample() {
  const {
    isVisible,
    selectedFriends,
    openSelection,
    closeSelection,
    handleConfirm,
    clearSelection,
  } = useGroupScheduleSelection();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>단체 일정 예시</Text>
      
      <TouchableOpacity style={styles.button} onPress={openSelection}>
        <Text style={styles.buttonText}>단체 일정 참여자 선택</Text>
      </TouchableOpacity>

      {selectedFriends.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>선택된 친구들:</Text>
          {selectedFriends.map((friend, index) => (
            <Text key={friend.id} style={styles.selectedFriend}>
              {index + 1}. {friend.name}
            </Text>
          ))}
          <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
            <Text style={styles.clearButtonText}>선택 초기화</Text>
          </TouchableOpacity>
        </View>
      )}

      <GroupScheduleSelectionScreen
        visible={isVisible}
        onClose={closeSelection}
        onConfirm={handleConfirm}
        maxSelection={5} // 최대 5명까지 선택 가능
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  selectedFriend: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    paddingLeft: 8,
  },
  clearButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
