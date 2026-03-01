import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AppHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>TrueNeed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingBottom: 15,
    alignItems: "center",
    backgroundColor: "#ecfdf5",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#065f46",
    letterSpacing: 1,
  },
});