import SmallButton from "@/components/ui/SmallButton";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  avatar: string; // ← 서버에서 내려주는 imageUrl (카톡 프로필)
  name: string;
  bio?: string;
  onConfirm: () => void;
  onDelete: () => void;
};

export default function FriendRequestItem({ avatar, name, bio, onConfirm, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {/* ✅ 이제 fallback 제거, 서버 imageUrl만 사용 */}
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.textBox}>
          <Text style={styles.name}>{name}</Text>
          {bio ? (
            <Text style={styles.bio} numberOfLines={1} ellipsizeMode="tail">
              {bio}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        <SmallButton label="삭제" outline onPress={onDelete} />
        <SmallButton label="확인" onPress={onConfirm} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEE",
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  bio: {
    fontSize: 13,
    color: "#64748B",
  },
  rowRight: {
    flexDirection: "row",
    flexShrink: 0,
    gap: 8,
  },
});
