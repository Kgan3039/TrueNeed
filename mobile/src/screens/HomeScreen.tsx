import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";


export default function HomeScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeOffers = onSnapshot(
      collection(db, "offers"),
      (snapshot) => {
        const offers = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "offer",
          ...doc.data(),
        }));

        setPosts((prev) => {
          const filtered = prev.filter((p) => p.type !== "offer");
          return [...filtered, ...offers];
        });
      }
    );

    const unsubscribeRequests = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
        const requests = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "request",
          ...doc.data(),
        }));

        setPosts((prev) => {
          const filtered = prev.filter((p) => p.type !== "request");
          return [...filtered, ...requests];
        });
      }
    );

    return () => {
      unsubscribeOffers();
      unsubscribeRequests();
    };
  }, []);

  const sortedPosts = [...posts].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      
      {/* ACTION BUTTONS */}
      <View style={{ marginBottom: 20 }}>
        <Button
          title="Create Offer"
          onPress={() => navigation.navigate("CreateOffer")}
        />
        <View style={{ height: 10 }} />
        <Button
          title="Create Request"
          onPress={() => navigation.navigate("CreateRequest")}
        />
        <View style={{ height: 10 }} />
        <Button
          title="View Matches"
          onPress={() => navigation.navigate("MatchInbox")}
        />
      </View>

      {/* FEED */}
      <FlatList
        data={sortedPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold" }}>
              {item.type === "offer" ? "OFFER: " : "REQUEST: "}
              {item.title}
            </Text>
            <Text>Category: {item.category}</Text>
            {item.quantity && <Text>Quantity: {item.quantity}</Text>}
            {item.urgency && <Text>Urgency: {item.urgency}</Text>}
          </View>
        )}
      />
    </View>
  );
}