// components/GroupScheduleSelectionScreen.tsx
import { RowItem } from "@/hooks/useFriends";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import GroupScheduleFriendList from "./GroupScheduleFriendList";

interface GroupScheduleSelectionScreenProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedFriends: RowItem[]) => void;
  maxSelection?: number;
  initialSelectedFriends?: RowItem[];
}

export default function GroupScheduleSelectionScreen({
  visible,
  onClose,
  onConfirm,
  maxSelection = 10,
  initialSelectedFriends = [],
}: GroupScheduleSelectionScreenProps) {
  const [selectedFriends, setSelectedFriends] = useState<RowItem[]>(initialSelectedFriends);

  // visible이 변경될 때마다 초기 선택된 친구들을 동기화
  useEffect(() => {
    if (visible) {
      setSelectedFriends(initialSelectedFriends);
    }
  }, [visible, initialSelectedFriends]);

  const handleFriendSelect = (friend: RowItem) => {
    setSelectedFriends(prev => {
      const isAlreadySelected = prev.some(f => f.id === friend.id);
      if (isAlreadySelected) {
        // 이미 선택된 친구라면 선택 해제
        return prev.filter(f => f.id !== friend.id);
      } else {
        // 새로운 친구 선택
        return [...prev, friend];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedFriends.length === 0) {
      Alert.alert("알림", "최소 1명의 친구를 선택해주세요.");
      return;
    }
    onConfirm(selectedFriends);
    setSelectedFriends([]); // 선택 초기화
  };

  const handleClose = () => {
    if (selectedFriends.length > 0) {
      Alert.alert(
        "선택 취소",
        "선택한 친구 목록이 초기화됩니다. 계속하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          {
            text: "확인",
            style: "destructive",
            onPress: () => {
              setSelectedFriends([]);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>단체 일정 참여자 선택</Text>
          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[
              styles.confirmButton,
              selectedFriends.length === 0 && styles.confirmButtonDisabled
            ]}
            disabled={selectedFriends.length === 0}
          >
            <Text style={[
              styles.confirmButtonText,
              selectedFriends.length === 0 && styles.confirmButtonTextDisabled
            ]}>
              확인
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <GroupScheduleFriendList
            onFriendSelect={handleFriendSelect}
            selectedFriends={selectedFriends}
            maxSelection={maxSelection}
          />
        </View>

        {selectedFriends.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedInfoText}>
              선택된 친구: {selectedFriends.map(f => f.name).join(", ")}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  confirmButtonTextDisabled: {
    color: "#9ca3af",
  },
  content: {
    flex: 1,
  },
  selectedInfo: {
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  selectedInfoText: {
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "500",
  },
});
