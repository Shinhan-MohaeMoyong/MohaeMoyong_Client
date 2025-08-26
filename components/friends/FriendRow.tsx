// components/friends/FriendRow.tsx
import SmallButton from "@/components/ui/SmallButton";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function FriendRow({
  tab,
  friend,
  onPrimary,
  primaryLabel, // ✅ 추가
}: {
  tab: "friends" | "requests";
  friend: { id: number; name: string; avatar: string };
  onPrimary: () => void;
  primaryLabel?: string; // ✅ 추가
}) {
  const defaultLabel = tab === "requests" ? "요청 취소" : "친구 삭제";
  const label = primaryLabel ?? defaultLabel; // ✅ 우선 사용

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Image source={{ uri: friend.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{friend.name}</Text>
      </View>
      <View style={styles.rowRight}>
        <SmallButton label={label} onPress={onPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEE", marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  rowRight: { flexDirection: "row" },
});
