import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 14, color: "#64748B" },
  tabTextActive: { color: "#000", fontWeight: "700" },
  tabIndicator: { marginTop: 6, width: 24, height: 2, backgroundColor: "#8C93FF", borderRadius: 1 },
});
