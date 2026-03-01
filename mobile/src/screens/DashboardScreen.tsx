import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export default function DashboardScreen() {
  const uid = auth.currentUser?.uid;

  const [offersCount, setOffersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);

  useEffect(() => {
    if (!uid) return;

    const offersQ = query(collection(db, "offers"), where("ownerUid", "==", uid));
    const requestsQ = query(collection(db, "requests"), where("ownerUid", "==", uid));
    const matchesQ = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", uid),
      where("status", "==", "accepted")
    );

    const unsub1 = onSnapshot(offersQ, (s) => setOffersCount(s.size));
    const unsub2 = onSnapshot(requestsQ, (s) => setRequestsCount(s.size));
    const unsub3 = onSnapshot(matchesQ, (s) => setAcceptedCount(s.size));

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [uid]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <Text style={styles.profileTitle}>Your Account</Text>
        <Text style={styles.profileEmail}>
          {auth.currentUser?.email}
        </Text>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Your Activity</Text>

      <View style={styles.statsGrid}>
        <StatCard label="Offers Posted" value={offersCount} />
        <StatCard label="Requests Posted" value={requestsCount} />
        <StatCard label="Accepted Matches" value={acceptedCount} />
      </View>

    </ScrollView>
  );
}

function StatCard({ label, value }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 20,
  },

  profileCard: {
    backgroundColor: "white",
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },

  profileTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
  },

  profileEmail: {
    fontSize: 14,
    color: "#444",
  },

  sectionTitle: {
    marginTop: 30,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
  },

  statsGrid: {
    gap: 15,
  },

  statCard: {
    backgroundColor: "white",
    paddingVertical: 25,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10b981",
  },

  statLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
});