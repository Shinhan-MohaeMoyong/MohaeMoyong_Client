// components/friends/GroupScheduleFriendList.tsx
import { SERVER_URL } from "@/constants/server";
import { getToken } from "@/contexts/tokenManager";
import { RowItem } from "@/hooks/useFriends";
import { FriendEntity } from "@/types";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface GroupScheduleFriendListProps {
  onFriendSelect: (friend: RowItem) => void;
  selectedFriends?: RowItem[];
  maxSelection?: number;
}

export default function GroupScheduleFriendList({
  onFriendSelect,
  selectedFriends = [],
  maxSelection,
}: GroupScheduleFriendListProps) {
  const [friends, setFriends] = useState<FriendEntity[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/v1/friends`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await getToken()}`,
          },
        });
        const data = await response.json();
        setFriends(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };
    loadFriends();
  }, []);

  const isSelected = (friend: RowItem) => {
    return selectedFriends.some(selected => selected.id === friend.id);
  };

  const canSelect = () => {
    if (!maxSelection) return true;
    return selectedFriends.length < maxSelection;
  };

  const handleFriendPress = (friend: RowItem) => {
    if (isSelected(friend)) {
      // 이미 선택된 친구라면 선택 해제
      const newSelected = selectedFriends.filter(f => f.id !== friend.id);
      onFriendSelect(friend); // 부모 컴포넌트에서 선택 해제 처리
    } else if (canSelect()) {
      // 선택 가능한 상태라면 선택
      onFriendSelect(friend);
    }
  };

  const renderFriendItem = ({ item }: { item: RowItem }) => {
    const selected = isSelected(item);
    const disabled = !selected && !canSelect();

    return (
      <TouchableOpacity
        style={[
          styles.friendRow,
          selected && styles.selectedRow,
          disabled && styles.disabledRow
        ]}
        onPress={() => handleFriendPress(item)}
        disabled={disabled}
      >
        <View style={styles.left}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: item.imageUrl || "https://via.placeholder.com/40" }} 
              style={styles.avatar} 
            />
            {selected && <View style={styles.selectedIndicator} />}
          </View>
          <Text style={[
            styles.name,
            selected && styles.selectedName,
            disabled && styles.disabledName
          ]}>
            {item.name}
          </Text>
        </View>
        {selected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>친구 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>친구 리스트</Text>
      {maxSelection && (
        <Text style={styles.subtitle}>
          {selectedFriends.length}/{maxSelection}명 선택됨
        </Text>
      )} */}
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={true}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f9fafb",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#f9fafb",
  },
  list: {
    flex: 1,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  selectedRow: {
    backgroundColor: "#f0f9ff",
  },
  disabledRow: {
    opacity: 0.5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  selectedIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8C93FF",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  selectedName: {
    color: "#1e40af",
    fontWeight: "600",
  },
  disabledName: {
    color: "#9ca3af",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8C93FF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginLeft: 72, // avatar + margin + name 시작점
  },
  loadingText: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
    fontSize: 16,
  },
});
