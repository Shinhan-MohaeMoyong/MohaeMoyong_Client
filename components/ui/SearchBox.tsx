import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
} & Omit<TextInputProps, "value" | "onChangeText" | "placeholder">;

export default function SearchBox({ value, onChangeText, placeholder = "Search", ...rest }: Props) {
  return (
    <View style={styles.box}>
      <Ionicons name="search" size={20} color="#767680" style={{ marginHorizontal: 8 }} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 4,
  },
  input: { flex: 1, color: "#000", fontSize: 14 },
});
