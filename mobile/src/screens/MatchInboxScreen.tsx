import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { db } from "../firebase/firebase";
import { theme } from "../theme";
import { RootStackParamList } from "../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "MatchInbox">;

type Match = {
  id: string;
  offerTitle?: string;
  requestTitle?: string;
  score?: number;
  reasons?: string[];
  status: "proposed" | "accepted" | "rejected";

  // optional if your matching team adds them later
  offerId?: string;
  requestId?: string;
  offerOwnerUid?: string;
  requestOwnerUid?: string;
  createdAt?: any;
};

function MatchCard({
  item,
  busyId,
  setStatus,
}: {
  item: Match;
  busyId: string | null;
  setStatus: (matchId: string, status: Match["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        backgroundColor: "white",
      }}
    >
      {/* Title Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "900" }}>
            {item.offerTitle ?? "Offer"}
          </Text>
          <Text style={{ fontSize: 12, color: theme.mutedText }}>
            → {item.requestTitle ?? "Request"}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "900", color: theme.greenDark }}>
            {Number(item.score ?? 0).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 11, color: theme.mutedText }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Reasons */}
      {Array.isArray(item.reasons) && item.reasons.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "900",
                color: theme.greenDark,
              }}
            >
              Why this match?
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "900",
                color: theme.greenDark,
              }}
            >
              {expanded ? "▲" : "▼"}
            </Text>
          </Pressable>

          <View
            style={{
              marginTop: 8,
              padding: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.greenSoft,
            }}
          >
            {!expanded ? (
              <Text style={{ fontSize: 12, color: theme.text }}>
                • {item.reasons[0]}
              </Text>
            ) : (
              item.reasons.map((r, idx) => (
                <Text key={idx} style={{ fontSize: 12, color: theme.text }}>
                  • {r}
                </Text>
              ))
            )}
          </View>
        </View>
      )}

      {/* Accept / Reject */}
      {item.status === "proposed" && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Pressable
            disabled={busyId === item.id}
            onPress={() => setStatus(item.id, "accepted")}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.green,
              backgroundColor: pressed ? theme.greenDark : theme.green,
              opacity: busyId === item.id ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "900",
                color: "white",
              }}
            >
              Accept
            </Text>
          </Pressable>

          <Pressable
            disabled={busyId === item.id}
            onPress={() => setStatus(item.id, "rejected")}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: pressed ? theme.greenSoft : "white",
              opacity: busyId === item.id ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "900",
                color: theme.greenDark,
              }}
            >
              Reject
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Inner component with "currentUid" passed normally (no navigation types here)
function MatchInboxInner({ currentUid }: { currentUid: string }) {
  const [tab, setTab] = useState<Match["status"]>("proposed");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Some teams name this field differently. We'll try the most likely one:
    // requestOwnerUid == current user (recipient of the match)
    const qy = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        const next = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Match[];
        setMatches(next);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [currentUid]);

  const filtered = useMemo(
    () => matches.filter((m) => m.status === tab),
    [matches, tab]
  );

  const setStatus = async (matchId: string, status: Match["status"]) => {
    setBusyId(matchId);
    try {
      await updateDoc(doc(db, "matches", matchId), { status });
    } finally {
      setBusyId(null);
    }
  };

  const Tab = ({ label, value }: { label: string; value: Match["status"] }) => (
    <Pressable
      onPress={() => setTab(value)}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: tab === value ? theme.green : theme.cardBorder,
        backgroundColor: tab === value ? theme.greenSoft : "white",
      }}
    >
      <Text
        style={{
          fontWeight: "900",
          color: tab === value ? theme.greenDark : theme.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
        Match Inbox
      </Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <Tab label="Proposed" value="proposed" />
        <Tab label="Accepted" value="accepted" />
        <Tab label="Rejected" value="rejected" />
      </View>

      {loading ? (
        <View style={{ paddingTop: 30 }}>
          <ActivityIndicator />
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderStyle: "dashed",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Text style={{ opacity: 0.7 }}>No {tab} matches yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MatchCard item={item} busyId={busyId} setStatus={setStatus} />
          )}
        />
      )}
    </View>
  );
}

// ✅ ONLY default export: screen component reading from route.params
export default function MatchInboxScreen({ route }: Props) {
  const { currentUid } = route.params;
  return <MatchInboxInner currentUid={currentUid} />;
}