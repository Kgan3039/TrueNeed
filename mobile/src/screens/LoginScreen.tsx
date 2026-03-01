import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import Screen from "../components/Screen";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin() {
    if (!email || !pw) {
      Alert.alert("Missing info", "Enter email + password.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), pw);
      // App.tsx onAuthStateChanged will route to Home
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Login</Text>

      <View style={{ height: 12 }} />

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <View style={{ height: 10 }} />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <View style={{ height: 12 }} />

      <Button title={loading ? "Logging in..." : "Login"} onPress={onLogin} />

      <View style={{ height: 8 }} />

      <Button title="Go to Signup" onPress={() => navigation.navigate("Signup")} />
    </Screen>
  );
}