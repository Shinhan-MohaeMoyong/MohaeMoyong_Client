import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

export type TopTabKey = "계좌" | "일정" | "저축";

type Props = {
  active: TopTabKey;
  onChange?: (key: TopTabKey) => void;
  style?: ViewStyle;
};

export default function TopTabs({ active, onChange, style }: Props) {
  const tabs: TopTabKey[] = ["계좌", "일정", "저축"];
  return (
    <View style={[styles.row, style]}>
      {tabs.map((label) => {
        const isActive = active === label;
        return (
          <Pressable key={label} onPress={() => onChange?.(label)} style={styles.item} hitSlop={6}>
            <Text style={[styles.text, isActive ? styles.textActive : styles.textInactive]}>{label}</Text>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", flex: 1 },
  item: { alignItems: "center", flex: 1 },
  text: { fontSize: 14, fontWeight: "800" },
  textActive: { color: "#222" },
  textInactive: { color: "#B8BDC3" },
  underline: { marginTop: 4, height: 2, backgroundColor: "#222", width: 28, borderRadius: 1 },
});
