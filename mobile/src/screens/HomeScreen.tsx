import React from "react";
import { Button, Text, View } from "react-native";
import Screen from "../components/Screen";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function HomeScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 26, fontWeight: "800" }}>TrueNeed</Text>
      <View style={{ height: 8 }} />
      <Text>Logged in ✅</Text>
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={() => signOut(auth)} />
    </Screen>
  );
}