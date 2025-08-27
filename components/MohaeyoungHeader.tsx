import { Ionicons } from "@expo/vector-icons";
import { GestureResponderEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title?: string;         // 기본 "시간표"
  weekLabel?: string;     // "2025년 2학기"
  name?: string;          // "김소연"
  onPressWeek?: (e: GestureResponderEvent) => void;
  onPressAdd?: (e: GestureResponderEvent) => void;
};

export default function MohaeyoungHeader({
  title = "시간표",
  weekLabel = "2025년 2학기",
  name = "",
  onPressWeek,
  onPressAdd,
}: Props) {
  return (
    <View style={styles.container}>
      {/* 좌측: 학기 라벨 + 이름/제목 */}
      <View style={styles.left}>
        <Pressable onPress={onPressWeek} hitSlop={8}>
          <Text style={styles.term} numberOfLines={1} ellipsizeMode="tail">
            {weekLabel}
          </Text>
        </Pressable>

        <View style={styles.titleRow}>
          {!!name && (
            <>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {name}
              </Text>
              <Text style={styles.suffix}>의 {title}</Text>
            </>
          )}
          {!name && (
            <Text style={styles.titleOnly}>{title}</Text>
          )}
        </View>
      </View>

      {/* 오른쪽 아이콘 */}
      <View style={styles.iconRow}>
        <TouchableOpacity
          onPress={onPressAdd}
          style={styles.addBox}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={20} color="#2B2B2B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}   

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  left: { flex: 1 },
  term: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E53935",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginRight: 4,
  },
  suffix: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  titleOnly: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginLeft: 12,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGhost: {
    alignItems: "center",
    justifyContent: "center",
  },
    iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconGap: {
    marginLeft: 18,
  },
  addBox: {
    width: 30,
    height: 30,
    borderWidth: 1.5,
    borderColor: "#2B2B2B",
    borderRadius: 8, // 라운드 박스
    alignItems: "center",
    justifyContent: "center",
    // 살짝 떠 보이게 (이미지 톤 맞춤)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
