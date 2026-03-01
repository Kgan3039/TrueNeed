import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export default function CreateRequestScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Title required");
      return;
    }

    try {
      await addDoc(collection(db, "requests"), {
        ownerUid: auth.currentUser?.uid,
        title: title.trim(),
        category: category.trim().toLowerCase(),
        urgency: Number(urgency) || 0,
        status: "open",
        createdAt: Date.now(),
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error creating request");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Create Request</Text>

        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Category"
          value={category}
          onChangeText={setCategory}
        />

        <Input
          label="Urgency (1-5)"
          value={urgency}
          onChangeText={setUrgency}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryText}>Post Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Input({ label, ...props }: any) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#888"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 25,
    borderRadius: 16,
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 25,
    color: "#065f46",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#065f46",
  },

  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  primaryButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
  },

  primaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});