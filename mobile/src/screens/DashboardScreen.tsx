import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { db } from "../firebase/firebase";
import { theme } from "../theme";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        padding: 14,
        backgroundColor: "white",
        minWidth: 140,
      }}
    >
      <Text style={{ fontSize: 12, opacity: 0.7 }}>{label}</Text>
      <Text style={{ fontSize: 28, fontWeight: "900", marginTop: 6 }}>
        {value}
      </Text>
    </View>
  );
}

// ✅ Logic-only component (no navigation types here)
function DashboardInner({ currentUid }: { currentUid: string }) {
  const [offersPosted, setOffersPosted] = useState(0);
  const [requestsPosted, setRequestsPosted] = useState(0);
  const [acceptedMatches, setAcceptedMatches] = useState(0);

  const [offersLoaded, setOffersLoaded] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [acceptedLoaded, setAcceptedLoaded] = useState(false);

  useEffect(() => {
    // count your offers
    const offersQ = query(
      collection(db, "offers"),
      where("ownerUid", "==", currentUid)
    );

    // count your requests
    const requestsQ = query(
      collection(db, "requests"),
      where("ownerUid", "==", currentUid)
    );

    // count matches accepted by you (recipient side)
    const acceptedQ = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid),
      where("status", "==", "accepted")
    );

    const u1 = onSnapshot(
      offersQ,
      (s) => {
        setOffersPosted(s.size);
        setOffersLoaded(true);
      },
      () => setOffersLoaded(true)
    );

    const u2 = onSnapshot(
      requestsQ,
      (s) => {
        setRequestsPosted(s.size);
        setRequestsLoaded(true);
      },
      () => setRequestsLoaded(true)
    );

    const u3 = onSnapshot(
      acceptedQ,
      (s) => {
        setAcceptedMatches(s.size);
        setAcceptedLoaded(true);
      },
      () => setAcceptedLoaded(true)
    );

    return () => {
      u1();
      u2();
      u3();
    };
  }, [currentUid]);

  const loading = useMemo(
    () => !(offersLoaded && requestsLoaded && acceptedLoaded),
    [offersLoaded, requestsLoaded, acceptedLoaded]
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "900",
          color: theme.greenDark,
          marginBottom: 10,
        }}
      >
        Dashboard
      </Text>

      {loading ? (
        <View style={{ paddingTop: 30 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <>
          {/* 2-up row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <Metric label="Your offers posted" value={offersPosted} />
            <Metric label="Your requests posted" value={requestsPosted} />
          </View>

          {/* single row */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Metric label="Accepted matches" value={acceptedMatches} />
          </View>

          {/* optional demo blurb */}
          <View style={{ marginTop: 14 }}>
            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              Tip: Accepted matches update as soon as you tap “Accept” in Match
              Inbox.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

// ✅ ONLY default export: screen component reading route params
export default function DashboardScreen({ route }: Props) {
  const { currentUid } = route.params;
  return <DashboardInner currentUid={currentUid} />;
}