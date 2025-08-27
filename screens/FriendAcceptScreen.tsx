import FriendRequestItem from "@/components/friends/FriendRequestItem";
import Divider from "@/components/ui/Divider";
import HeaderBar from "@/components/ui/HeaderBar";
import NoticeModal from "@/components/ui/NoticeModal";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";

export default function FriendAcceptScreen() {
  const { requests, confirmRequest, deleteRequest } = useFriendRequests(); // ✅ hook 사용

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const handleConfirm = async (id: number) => {
    const res = await confirmRequest(id);
    setModalMsg(res.message);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    const res = await deleteRequest(id);
    setModalMsg(res.message);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="친구 수락" />
      <Divider style={{ marginTop: 8, marginBottom: 12, marginHorizontal: 16 }} />

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.requestId)}
        ItemSeparatorComponent={() => <Divider style={{ marginLeft: 72 }} />}
        renderItem={({ item }) => (
          <FriendRequestItem
            avatar={item.avatar}
            name={item.name}
            bio={item.bio}
            onConfirm={() => handleConfirm(item.requestId)}
            onDelete={() => handleDelete(item.requestId)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />

      {/* ✅ NoticeModal */}
      <NoticeModal
        visible={modalVisible}
        message={modalMsg}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
