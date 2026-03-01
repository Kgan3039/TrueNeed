import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "MatchInbox"
>;

type Match = {
  id: string;
  offerTitle?: string;
  requestTitle?: string;
  offerId?: string | null;
  requestId?: string | null;
  score?: number | string;
  reasons?: string[];
  status: "proposed" | "accepted" | "rejected";
  requestOwnerUid?: string;
};

export default function MatchInboxScreen({}: Props) {
  const currentUid = auth.currentUser?.uid;

  const [tab, setTab] =
    useState<Match["status"]>("proposed");
  const [busyId, setBusyId] =
    useState<string | null>(null);
  const [matches, setMatches] =
    useState<Match[]>([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!currentUid) return;

    const qy = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid)
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        setMatches(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUid]);

  const filtered = useMemo(
    () => matches.filter((m) => m.status === tab),
    [matches, tab]
  );

  const setStatus = async (
    match: Match,
    status: Match["status"]
  ) => {
    setBusyId(match.id);

    try {
      await updateDoc(
        doc(db, "matches", match.id),
        { status }
      );
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Error",
        "Failed to update match."
      );
    } finally {
      setBusyId(null);
    }
  };

  const TabButton = ({
    label,
    value,
  }: {
    label: string;
    value: Match["status"];
  }) => (
    <Pressable
      onPress={() => setTab(value)}
      style={[
        styles.tab,
        tab === value && styles.activeTab,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          tab === value &&
            styles.activeTabText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Match Inbox
      </Text>

      <View style={styles.tabRow}>
        <TabButton
          label="Proposed"
          value="proposed"
        />
        <TabButton
          label="Accepted"
          value="accepted"
        />
        <TabButton
          label="Rejected"
          value="rejected"
        />
      </View>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 30 }}
        />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ opacity: 0.7 }}>
            No {tab} matches yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MatchCard
              item={item}
              busyId={busyId}
              setStatus={setStatus}
            />
          )}
        />
      )}
    </View>
  );
}

function MatchCard({
  item,
  busyId,
  setStatus,
}: {
  item: Match;
  busyId: string | null;
  setStatus: (
    match: Match,
    status: Match["status"]
  ) => void;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const scoreNum =
    typeof item.score === "number"
      ? item.score
      : Number(item.score);

  const scoreText =
    Number.isFinite(scoreNum)
      ? scoreNum.toFixed(2)
      : "—";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            {item.offerTitle ??
              "Offer"}
          </Text>
          <Text style={styles.subText}>
            →{" "}
            {item.requestTitle ??
              "Request"}
          </Text>
        </View>

        <View
          style={{ alignItems: "flex-end" }}
        >
          <Text style={styles.score}>
            {scoreText}
          </Text>
          <Text style={styles.status}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {item.status === "proposed" && (
        <View style={styles.buttonRow}>
          <Pressable
            disabled={busyId === item.id}
            onPress={() =>
              setStatus(
                item,
                "accepted"
              )
            }
            style={styles.acceptBtn}
          >
            <Text
              style={styles.acceptText}
            >
              Accept
            </Text>
          </Pressable>

          <Pressable
            disabled={busyId === item.id}
            onPress={() =>
              setStatus(
                item,
                "rejected"
              )
            }
            style={styles.rejectBtn}
          >
            <Text
              style={styles.rejectText}
            >
              Reject
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf5",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#065f46",
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
  },
  activeTab: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  tabText: {
    fontWeight: "800",
    color: "#374151",
  },
  activeTabText: {
    color: "#065f46",
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 14,
  },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  subText: {
    fontSize: 12,
    color: "#6b7280",
  },
  score: {
    fontWeight: "900",
    color: "#065f46",
  },
  status: {
    fontSize: 11,
    color: "#6b7280",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#10b981",
    alignItems: "center",
  },
  acceptText: {
    color: "white",
    fontWeight: "900",
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10b981",
    alignItems: "center",
  },
  rejectText: {
    color: "#065f46",
    fontWeight: "900",
  },
});