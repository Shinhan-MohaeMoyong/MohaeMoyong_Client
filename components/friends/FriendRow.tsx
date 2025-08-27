// components/friends/FriendRow.tsx
import SmallButton from "@/components/ui/SmallButton";
import { Image, StyleSheet, Text, View } from "react-native";

export default function FriendRow({
  tab,
  friend,
  onPrimary,
  primaryLabel,
}: {
  tab: "friends" | "requests";
  friend: { id: number; name: string; avatar: string };
  onPrimary: () => void;
  primaryLabel?: string;
}) {
  const defaultLabel = tab === "requests" ? "요청 취소" : "친구 삭제";
  const label = primaryLabel ?? defaultLabel;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Image source={{ uri: friend.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{friend.name}</Text>
      </View>
      <SmallButton label={label} onPress={onPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  left: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
});