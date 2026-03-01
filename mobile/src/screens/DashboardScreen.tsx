import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { theme } from "../theme";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 }}>
      <Text style={{ fontSize: 12, opacity: 0.7 }}>{label}</Text>
      <Text style={{ fontSize: 28, fontWeight: "900", marginTop: 6 }}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen({ currentUid }: { currentUid: string }) {
  const [offersPosted, setOffersPosted] = useState(0);
  const [requestsPosted, setRequestsPosted] = useState(0);
  const [acceptedMatches, setAcceptedMatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const offersQ = query(collection(db, "offers"), where("ownerUid", "==", currentUid));
    const requestsQ = query(collection(db, "requests"), where("ownerUid", "==", currentUid));
    const acceptedQ = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid),
      where("status", "==", "accepted")
    );

    const u1 = onSnapshot(offersQ, (s) => { setOffersPosted(s.size); setLoading(false); });
    const u2 = onSnapshot(requestsQ, (s) => { setRequestsPosted(s.size); setLoading(false); });
    const u3 = onSnapshot(acceptedQ, (s) => { setAcceptedMatches(s.size); setLoading(false); });

    return () => { u1(); u2(); u3(); };
  }, [currentUid]);

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", marginBottom: 10 }}>Dashboard</Text>

      {loading ? (
        <View style={{ paddingTop: 30 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Metric label="Your offers posted" value={offersPosted} />
          <Metric label="Your requests posted" value={requestsPosted} />
          <Metric label="Accepted matches" value={acceptedMatches} />
        </View>
      )}
    </View>
  );
}
