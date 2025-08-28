import { Ionicons } from "@expo/vector-icons";
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title?: string;
  weekLabel?: string;
  name?: string;
  onPressWeek?: (e: GestureResponderEvent) => void;
  onPressAdd?: (e: GestureResponderEvent) => void;
};

export default function MohaeyoungHeader({
  title = "시간표",
  weekLabel = "7월 셋째 주",
  name,
  onPressWeek,
  onPressAdd,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
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
      
      <View style={styles.iconRow}>
        <TouchableOpacity
          onPress={onPressAdd}
          style={styles.addBox}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
//    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  left: { flex: 1 },
  term: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8C93FF",
    marginBottom: 2,
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
    width: 36,
    height: 36,
    borderRadius: 18,            // 동그란 버튼
    backgroundColor: "#8C93FF",  // 보라색 배경
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});