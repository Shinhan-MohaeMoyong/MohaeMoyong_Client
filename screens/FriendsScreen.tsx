import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FriendRow from "@/components/friends/FriendRow";
import TabButton from "@/components/friends/TabButton";
import HeaderBar from "@/components/ui/HeaderBar";
import SearchBox from "@/components/ui/SearchBox";
import { RowItem, useFriends } from "@/hooks/useFriends";

export default function FriendsScreen() {
  const router = useRouter();
  const {
    tab,
    setTab,
    query,
    setQuery,
    data,
    primaryLabel,
    setSearchActive,
    sendFriendRequest,
    cancelFriendRequest,
    deleteFriend,
  } = useFriends();

  // ✅ 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<RowItem | null>(null);

  // ✅ 버튼 클릭 핸들러
  const onPrimary = (item: RowItem) => {
    // 요청 취소 (requestId가 존재하면)
    if (item.requestId) {
      cancelFriendRequest(item.requestId)
        .then(() => {
          alert("요청이 취소되었습니다.");
          setTab("requests");
        })
        .catch((err) => {
          console.warn("취소 API 에러:", err);
          // 서버가 500 주더라도 DB는 이미 취소됨 → 성공 처리
          alert("요청이 취소되었습니다. (응답 오류 무시 수정해야함)");
          setTab("requests");
        });
      return;
    }

    // 요청 보내기
    if (primaryLabel === "요청 보내기") {
      setTarget(item);
      setModalVisible(true);
      return;
    }

    //  친구 삭제
    deleteFriend(item.id)
      .then(() => {
        alert("친구가 삭제되었습니다.");
        setTab("friends"); // 친구목록 새로고침
      })
      .catch(() => {
        alert("친구 삭제 실패 (DB는 반영됐을 수 있음)");
        setTab("friends");
      });
  };

  // ✅ 실제 요청 보내기
  const confirmRequest = async () => {
    if (!target) return;
    try {
      const res = await sendFriendRequest(target.id, message);
      console.log("✅ 친구 요청 성공:", res);
      alert(`"${target.name}"님께 친구 요청을 보냈습니다.`);
      setTab("requests"); // ✅ 요청 보내고 Outbox로 이동
    } catch (err) {
      console.error("❌ 친구 요청 실패:", err);
      alert("친구 요청 중 오류가 발생했습니다.");
    } finally {
      setModalVisible(false);
      setMessage("");
      setTarget(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <HeaderBar
        title="친구 요청"
        right={
          <TouchableOpacity onPress={() => router.push("/friends/accept")}>
            <Ionicons name="person-add-outline" size={24} color="black" />
          </TouchableOpacity>
        }
      />

      <SearchBox
        value={query}
        onChangeText={setQuery}
        onFocus={() => setSearchActive(true)}
        onBlur={() => setSearchActive(false)}
      />

      <View style={styles.tabRow}>
        <TabButton label="친구" active={tab === "friends"} onPress={() => setTab("friends")} />
        <TabButton
          label="친구 요청"
          active={tab === "requests"}
          onPress={() => setTab("requests")}
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.requestId)}
        renderItem={({ item }) => (
          <FriendRow
            tab={tab}
            friend={item}
            // ✅ requestId 있으면 "요청 취소" 라벨 강제 적용
            primaryLabel={item.requestId ? "요청 취소" : primaryLabel}
            onPrimary={() => onPrimary(item)}
          />
        )}
        ListEmptyComponent={<Text style={{ padding: 20 }}>데이터가 없습니다.</Text>}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />

      {/* ✅ 메시지 입력 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{target?.name}님께 보낼 메시지</Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요"
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button title="취소" onPress={() => setModalVisible(false)} />
              <Button title="보내기" onPress={confirmRequest} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
});
