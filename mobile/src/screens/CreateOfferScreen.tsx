import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";

export default function CreateOfferScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [locationText, setLocationText] = useState("");

  const handleSubmit = async () => {
    if (!title || !category || !quantity) {
      Alert.alert("Please fill all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "offers"), {
        ownerUid: auth.currentUser?.uid,
        title,
        category: category.trim().toLowerCase(),
        quantity,
        locationText,
        status: "open",
        createdAt: Date.now(),
      });

      Alert.alert("Offer posted!");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error posting offer");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        placeholder="Title"
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
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <TextInput
        placeholder="Location"
        value={locationText}
        onChangeText={setLocationText}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />

      <Button title="Post Offer" onPress={handleSubmit} />
    </View>
  );
}