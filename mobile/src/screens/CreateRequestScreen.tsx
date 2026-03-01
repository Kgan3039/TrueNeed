import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";

export default function CreateRequestScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");

  const handleSubmit = async () => {
    if (!title || !category) {
      Alert.alert("Please fill required fields");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        ownerUid: auth.currentUser?.uid,
        title,
        category,
        urgency,
        status: "open",
        createdAt: Date.now(),
      });

      Alert.alert("Request posted!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error posting request");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="What do you need?"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Urgency (High / Medium / Low)"
        value={urgency}
        onChangeText={setUrgency}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button title="Post Request" onPress={handleSubmit} />
    </View>
  );
}