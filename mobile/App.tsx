import React, { useState } from "react";
import { SafeAreaView, Text, View, Pressable } from "react-native";
import MatchInboxScreen from "./src/screens/MatchInboxScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import GenerateMatchButton from "./src/components/GenerateMatchButton";
import { theme } from "./src/theme";

export default function App() {
  // If auth is working later, replace with auth.currentUser?.uid
  const currentUid = "demoUser1";

  const [page, setPage] = useState<"inbox" | "dashboard">("inbox");

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#f0fdf4" }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: theme.greenDark }}>TrueNeed</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={() => setPage("inbox")}
            style={({ pressed }) => ({
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: page === "inbox" ? theme.green : theme.border,
              backgroundColor: page === "inbox" ? theme.greenSoft : "white",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: "900", color: page === "inbox" ? theme.greenDark : theme.text }}>Inbox</Text>
          </Pressable>

          <Pressable
            onPress={() => setPage("dashboard")}
            style={({ pressed }) => ({
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: page === "dashboard" ? theme.green : theme.border,
              backgroundColor: page === "dashboard" ? theme.greenSoft : "white",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontWeight: "900", color: page === "dashboard" ? theme.greenDark : theme.text }}>Dashboard</Text>
          </Pressable>
        </View>
      </View>

      <GenerateMatchButton currentUid={currentUid} />

      <View style={{ flex: 1 }}>
        {page === "inbox" ? (
          <MatchInboxScreen currentUid={currentUid} />
        ) : (
          <DashboardScreen currentUid={currentUid} />
        )}
      </View>
    </SafeAreaView>
  );
}
