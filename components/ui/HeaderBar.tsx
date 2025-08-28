import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title: string;
  right?: React.ReactNode;
  showBack?: boolean;
  /** 필요하면 추가 여유 상단 간격을 바꿀 수 있게 */
  extraTopGap?: number; // 기본 8
};

export default function HeaderBar({
  title,
  right,
  showBack = true,
  extraTopGap = 10,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 🔹 노치/상단바 높이

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.push("/"); // ✅ 기본 경로
  };

  return (
    <View
      style={[
        styles.header,
        { paddingTop: extraTopGap }, 
        { paddingBottom: extraTopGap + extraTopGap}
      ]}
    >
      <View style={{ width: 24 }}>
        {showBack && (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 24, alignItems: "flex-end" }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12, // 🔹 아래도 살짝 여유
    backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "700" },
});
