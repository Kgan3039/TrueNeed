import React, { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import Screen from "../components/Screen";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignup() {
    if (!email || !pw) {
      Alert.alert("Missing info", "Enter email + password.");
      return;
    }
    if (pw.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), pw);
    } catch (e: any) {
      Alert.alert("Signup failed", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Signup</Text>

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
        placeholder="Password (6+ chars)"
        secureTextEntry
        value={pw}
        onChangeText={setPw}
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <View style={{ height: 12 }} />

      <Button title={loading ? "Creating..." : "Create Account"} onPress={onSignup} />

      <View style={{ height: 8 }} />

      <Button title="Back to Login" onPress={() => navigation.navigate("Login")} />
    </Screen>
  );
}