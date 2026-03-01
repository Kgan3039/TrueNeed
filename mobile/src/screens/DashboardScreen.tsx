import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";

export default function DashboardScreen() {
  const currentUid = auth.currentUser?.uid;

  const [offersCount, setOffersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    if (!currentUid) return;

    const offersQ = query(
      collection(db, "offers"),
      where("ownerUid", "==", currentUid)
    );

    const requestsQ = query(
      collection(db, "requests"),
      where("ownerUid", "==", currentUid)
    );

    const matchesQ = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid),
      where("status", "==", "accepted")
    );

    const unsubOffers = onSnapshot(offersQ, (snap) =>
      setOffersCount(snap.size)
    );

    const unsubRequests = onSnapshot(requestsQ, (snap) =>
      setRequestsCount(snap.size)
    );

    const unsubMatches = onSnapshot(matchesQ, (snap) =>
      setAcceptedCount(snap.size)
    );

    return () => {
      unsubOffers();
      unsubRequests();
      unsubMatches();
    };
  }, [currentUid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      Alert.alert("Error logging out");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Offers Posted</Text>
        <Text style={styles.metricValue}>{offersCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Requests Posted</Text>
        <Text style={styles.metricValue}>{requestsCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Accepted Matches</Text>
        <Text style={styles.metricValue}>{acceptedCount}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#065f46",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
  },

  metricLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#065f46",
    marginTop: 5,
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },

  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});