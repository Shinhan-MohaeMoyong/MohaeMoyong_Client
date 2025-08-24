import React from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

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
  name = "장가은",
  onPressWeek,
  onPressAdd,
}: Props) {
  return (
    <View>
        <Text style={styles.name}>{name}님의</Text>
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <Pressable onPress={onPressWeek} hitSlop={6}>
          <Text style={styles.week}>{weekLabel}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.addBtn} onPress={onPressAdd} hitSlop={6}>
        <Text style={styles.plus}>＋</Text>
      </Pressable>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 5,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
  },
  name: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 0
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  week: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E7AFF",
    paddingTop: 0
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 18,
    lineHeight: 18,
    color: "#111",
    includeFontPadding: false,
  },
});
