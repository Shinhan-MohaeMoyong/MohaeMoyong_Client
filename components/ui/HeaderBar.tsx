import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  title: string;
  right?: React.ReactNode;
  showBack?: boolean;
};

export default function HeaderBar({ title, right, showBack = true }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/"); // ✅ 홈 등 기본 경로
    }
  };

  return (
    <View style={styles.header}>
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
    paddingVertical: 12,
  },
  title: { fontSize: 18, fontWeight: "700" },
});
