import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = { style?: ViewStyle };

export default function Divider({ style }: Props) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
  },
});
