import FriendRequestItem from "@/components/friends/FriendRequestItem";
import Divider from "@/components/ui/Divider";
import HeaderBar from "@/components/ui/HeaderBar";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import React from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";

export default function FriendAcceptScreen() {
  const { requests, confirmRequest, deleteRequest } = useFriendRequests(); // ✅ hook 사용

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="친구 수락" />
      <Divider style={{ marginTop: 8, marginBottom: 12, marginHorizontal: 16 }} />

      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.requestId)} // ✅ requestId 기준
        ItemSeparatorComponent={() => <Divider style={{ marginLeft: 72 }} />}
        renderItem={({ item }) => (
          <FriendRequestItem
            avatar={item.avatar}
            name={item.name}
            bio={item.bio}
            onConfirm={() => confirmRequest(item.requestId)}
            onDelete={() => deleteRequest(item.requestId)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
