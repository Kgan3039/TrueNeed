import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  Alert,
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

import { acceptMatch } from "../services/matchAction";

type Props = NativeStackScreenProps<RootStackParamList, "MatchInbox">;

type Match = {
  id: string;
  offerTitle?: string;
  requestTitle?: string;
  score?: number | string; // allow string too, since Firestore might store it that way
  reasons?: string[];
  status: "proposed" | "accepted" | "rejected";
};


function MatchCard({
  item,
  busyId,
  setStatus,
}: {
  item: Match;
  busyId: string | null;
  setStatus: (match: Match, status: Match["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  //SAFER SCORE DISPLAY (prevents NaN)
  const scoreNum =
    typeof item.score === "number" ? item.score : Number(item.score);
  const scoreText = Number.isFinite(scoreNum) ? scoreNum.toFixed(2) : "—";

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
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "900" }}>{item.offerTitle ?? "Offer"}</Text>
          <Text style={{ fontSize: 12, color: theme.mutedText }}>
            → {item.requestTitle ?? "Request"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "900", color: theme.greenDark }}>
            {scoreText}
          </Text>
          <Text style={{ fontSize: 11, color: theme.mutedText }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>


      {Array.isArray(item.reasons) && item.reasons.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Pressable
            onPress={() => setExpanded((v) => !v)}
            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "900", color: theme.greenDark }}>
              Why this match?
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "900", color: theme.greenDark }}>
              {expanded ? "▲" : "▼"}
            </Text>
          </Pressable>

          {/* Explanation panel */}
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
              // collapsed preview (1 reason)
              <Text style={{ fontSize: 12, color: theme.text }}>
                • {item.reasons[0]}
              </Text>
            ) : (
              // expanded full list
              item.reasons.map((r, idx) => (
                <Text key={idx} style={{ fontSize: 12, color: theme.text }}>
                  • {r}
                </Text>
              ))
            )}
          </View>
        </View>
      )}

      {/* Accept / Reject Buttons */}
      {item.status === "proposed" && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Pressable
            disabled={busyId === item.id}
            onPress={() => setStatus(item, "accepted")}
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
            <Text style={{ textAlign: "center", fontWeight: "900", color: "white" }}>Accept</Text>
          </Pressable>

          <Pressable
            disabled={busyId === item.id}
            onPress={() => setStatus(item, "rejected")}
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
            <Text style={{ textAlign: "center", fontWeight: "900", color: theme.greenDark }}>
              Reject
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function MatchInboxScreen({ currentUid }: { currentUid: string }) {
  const [tab, setTab] = useState<Match["status"]>("proposed");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // requestOwnerUid == current user (recipient of the match)
    const qy = query(
      collection(db, "matches"),
      where("requestOwnerUid", "==", currentUid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      qy,
      (snap) => {
        setMatches(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [currentUid]);

  const filtered = useMemo(() => matches.filter((m) => m.status === tab), [matches, tab]);

  const setStatus = async (match: Match, status: Match["status"]) => {
    setBusyId(match.id);
    try {
      if (status === "accepted") {
        // We NEED offerId + requestId to complete the workflow
        if (!match.offerId || !match.requestId) {
          Alert.alert(
            "Missing data",
            "This match is missing offerId/requestId. Ask Mihir to include them when creating matches."
          );
          return;
        }

        await acceptMatch({
          matchId: match.id,
          offerId: match.offerId,
          requestId: match.requestId,
        });
      } else {
        // rejected (or any other future status) just updates the match
        await updateDoc(doc(db, "matches", match.id), { status });
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to update match.");
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
      <Text style={{ fontWeight: "900", color: tab === value ? theme.greenDark : theme.text }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: "900", color: theme.greenDark, marginBottom: 10 }}>
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
        <View style={{ borderWidth: 1, borderColor: theme.border, borderStyle: "dashed", borderRadius: 14, padding: 14 }}>
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

// ONLY default export: screen component reading from route.params
export default function MatchInboxScreen({ route }: Props) {
  const { currentUid } = route.params;
  return <MatchInboxInner currentUid={currentUid} />;
}