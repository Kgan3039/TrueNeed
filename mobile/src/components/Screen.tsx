import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function Screen({ children }: { children: React.ReactNode}) {
    return <SafeAreaView style={styles.root}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, gap: 12 },
});
