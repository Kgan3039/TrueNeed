import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export default function MatchInboxScreen() {
  const currentUid = auth.currentUser?.uid;

  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUid) return;

    const matchesQ = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid)
    );

    const unsub = onSnapshot(matchesQ, (snapshot) => {
      const next = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setMatches(next);
    });

    return () => unsub();
  }, [currentUid]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match Inbox</Text>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No matches yet.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Match with: {item.offerOwnerUid}
            </Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#065f46",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
  },

  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  cardTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
});