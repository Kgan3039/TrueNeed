import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export default function DashboardScreen() {
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);

  // PERSONAL
  const [offersCount, setOffersCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [fairnessScore, setFairnessScore] = useState(50);

  // GLOBAL
  const [totalOffers, setTotalOffers] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [totalImpactPoints, setTotalImpactPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ======================
        // PERSONAL DATA
        // ======================

        if (uid) {
          const offersSnap = await getDocs(
            query(
              collection(db, "offers"),
              where("ownerUid", "==", uid)
            )
          );
          setOffersCount(offersSnap.size);

          const requestsSnap = await getDocs(
            query(
              collection(db, "requests"),
              where("ownerUid", "==", uid)
            )
          );
          setRequestsCount(requestsSnap.size);

          const matchesSnap = await getDocs(
            query(
              collection(db, "matches"),
              where("requestOwnerUid", "==", uid),
              where("status", "==", "accepted")
            )
          );
          setAcceptedCount(matchesSnap.size);

          const userDoc = await getDoc(
            doc(db, "users", uid)
          );
          if (userDoc.exists()) {
            setFairnessScore(
              userDoc.data().fairnessScore ?? 50
            );
          }
        }

        // ======================
        // GLOBAL DATA
        // ======================

        const allOffers = await getDocs(
          collection(db, "offers")
        );
        setTotalOffers(allOffers.size);

        const allRequests = await getDocs(
          collection(db, "requests")
        );
        setTotalRequests(allRequests.size);

        const acceptedMatches = await getDocs(
          query(
            collection(db, "matches"),
            where("status", "==", "accepted")
          )
        );
        setTotalAccepted(acceptedMatches.size);

        // Global Impact = sum of each user's impact
        const usersSnap = await getDocs(
          collection(db, "users")
        );

        let globalImpact = 0;

        for (const user of usersSnap.docs) {
          const data = user.data();
          const fairness =
            data.fairnessScore ?? 50;
          const completed =
            data.completedMatches ?? 0;

          globalImpact +=
            completed * (fairness / 100);
        }

        setTotalImpactPoints(globalImpact);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  const personalImpact =
    acceptedCount * (fairnessScore / 100);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ================= PERSONAL ================= */}
      <Text style={styles.sectionTitle}>
        Your Contribution
      </Text>

      <StatCard
        label="Offers Posted"
        value={offersCount}
      />

      <StatCard
        label="Requests Posted"
        value={requestsCount}
      />

      <StatCard
        label="Accepted Matches"
        value={acceptedCount}
      />

      <StatCard
        label="Impact Points"
        value={personalImpact.toFixed(2)}
        highlight
      />

      {/* ================= GLOBAL ================= */}
      <Text style={[styles.sectionTitle, { marginTop: 30 }]}>
        Community Impact
      </Text>

      <StatCard
        label="Total Offers"
        value={totalOffers}
      />

      <StatCard
        label="Total Requests"
        value={totalRequests}
      />

      <StatCard
        label="Total Accepted Matches"
        value={totalAccepted}
      />

      <StatCard
        label="Total Impact Points"
        value={totalImpactPoints.toFixed(2)}
        highlight
      />
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        highlight && styles.highlightCard,
      ]}
    >
      <Text style={styles.cardLabel}>
        {label}
      </Text>
      <Text
        style={[
          styles.cardValue,
          highlight && styles.highlightValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#065f46",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    elevation: 4,
  },
  highlightCard: {
    backgroundColor: "#10b981",
  },
  cardLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 6,
    fontWeight: "700",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#065f46",
  },
  highlightValue: {
    color: "white",
  },
});