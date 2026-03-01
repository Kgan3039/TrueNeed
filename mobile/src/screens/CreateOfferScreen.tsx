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
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { computeFairnessScore } from "../services/fairness";

export default function CreateOfferScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not logged in");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Title required");
      return;
    }

    try {
      // Create offer
      await addDoc(collection(db, "offers"), {
        ownerUid: uid,
        title: title.trim(),
        category: category.trim().toLowerCase(),
        quantity: Number(quantity) || 0,
        status: "open",
        createdAt: Date.now(),
      });

      // Update fairness safely
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      const existing = userSnap.exists() ? userSnap.data() : {};

      const offersGiven = (existing.offersGiven || 0) + 1;
      const completedMatches = existing.completedMatches || 0;
      const activeRequests = existing.activeRequests || 0;

      const fairnessScore = computeFairnessScore({
        offersGiven,
        completedMatches,
        activeRequests,
      });

      await setDoc(userRef, {
        offersGiven,
        completedMatches,
        activeRequests,
        fairnessScore,
      });

      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error creating offer");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Offer</Text>

        <Input label="Title" value={title} onChangeText={setTitle} />
        <Input label="Category" value={category} onChangeText={setCategory} />
        <Input
          label="Quantity"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryText}>Post Offer</Text>
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