import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  outline?: boolean;
};

export default function SmallButton({ label, onPress, outline }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, outline ? styles.outline : styles.filled]}
    >
      <Text style={[styles.text, outline && styles.textOutline]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  filled: { backgroundColor: "#8C93FF" },
  outline: { backgroundColor: "white", borderWidth: 1, borderColor: "#CBD5E1" },
  text: { color: "white", fontWeight: "600", fontSize: 14 },
  textOutline: { color: "#334155" },
});
