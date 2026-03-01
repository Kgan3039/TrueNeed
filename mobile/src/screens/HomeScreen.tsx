import React, { useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, Button, Alert } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// TODO (later): uncomment once Mihir creates this file/function
// import { generateMatchForUser } from "../services/matchingService";

type Post = {
  id: string;
  type: "offer" | "request";
  title?: string;
  category?: string;
  quantity?: number;
  urgency?: number;
  locationText?: string;
  createdAt?: any; // number | Firestore Timestamp | missing
};

function toMillis(createdAt: any): number {
  if (!createdAt) return 0;
  if (typeof createdAt === "number") return createdAt;
  if (typeof createdAt?.toMillis === "function") return createdAt.toMillis();
  return 0;
}

export default function HomeScreen({ navigation }: any) {
  const [offers, setOffers] = useState<Post[]>([]);
  const [requests, setRequests] = useState<Post[]>([]);

  useEffect(() => {
    const offersQ = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const requestsQ = query(collection(db, "requests"), orderBy("createdAt", "desc"));

    const unsubOffers = onSnapshot(offersQ, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "offer" as const,
        ...(doc.data() as any),
      }));
      setOffers(next);
    });

    const unsubRequests = onSnapshot(requestsQ, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "request" as const,
        ...(doc.data() as any),
      }));
      setRequests(next);
    });

    return () => {
      unsubOffers();
      unsubRequests();
    };
  }, []);

  const mergedFeed = useMemo(() => {
    const all = [...offers, ...requests];
    all.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
    return all;
  }, [offers, requests]);

  const requireUid = (): string | null => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please log in again.");
      return null;
    }
    return uid;
  };

  const handleGenerateMatch = async () => {
    const uid = requireUid();
    if (!uid) return;

    try {
      // ✅ Mihir should wire his matching logic here:
      // await generateMatchForUser(uid);

      // Temporary placeholder so the button works before matching exists:
      Alert.alert(
        "Generate Match",
        "Hook Mihir's generateMatchForUser(uid) here. Then check Match Inbox."
      );
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate match");
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* ACTION BUTTONS */}
      <View style={{ marginBottom: 16 }}>
        <Button title="Create Offer" onPress={() => navigation.navigate("CreateOffer")} />
        <View style={{ height: 10 }} />

        <Button title="Create Request" onPress={() => navigation.navigate("CreateRequest")} />
        <View style={{ height: 10 }} />

        {/* ✅ NEW BUTTON: Mihir maps matching to this */}
        <Button title="Generate Match" onPress={handleGenerateMatch} />
        <View style={{ height: 10 }} />

        <Button
          title="View Matches"
          onPress={() => {
            const uid = requireUid();
            if (!uid) return;
            navigation.navigate("MatchInbox", { currentUid: uid });
          }}
        />
        <View style={{ height: 10 }} />

        <Button
          title="Dashboard"
          onPress={() => {
            const uid = requireUid();
            if (!uid) return;
            navigation.navigate("Dashboard", { currentUid: uid });
          }}
        />
      </View>

      {/* FEED */}
      <FlatList
        data={mergedFeed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "700" }}>
              {item.type === "offer" ? "OFFER: " : "REQUEST: "}
              {item.title ?? "(no title)"}
            </Text>

            {!!item.category && <Text>Category: {item.category}</Text>}
            {typeof item.quantity === "number" && <Text>Quantity: {item.quantity}</Text>}
            {typeof item.urgency === "number" && <Text>Urgency: {item.urgency}</Text>}
            {!!item.locationText && <Text>Location: {item.locationText}</Text>}
          </View>
        )}
      />
    </View>
  );
}