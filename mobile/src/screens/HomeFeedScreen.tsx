// screens/HomeFeedScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import {
  fetchOpenRequests,
  fetchOpenOffers,
  generateMatch,
  createMatch,
  acceptMatch,
  rejectMatch,
} from "../firebase/firestoreService";

export default function HomeFeedScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]); // local test state

  // Load open offers and requests
  useEffect(() => {
    async function loadData() {
      const reqs = await fetchOpenRequests();
      const offs = await fetchOpenOffers();
      console.log("Fetched Requests:", reqs);
      console.log("Fetched Offers:", offs);
      setRequests(reqs);
      setOffers(offs);
    }

    loadData();
  }, []);

  // Generate a match
  const handleGenerateMatch = async () => {
  const matchData = generateMatch(requests, offers);
  if (!matchData) {
    console.log("No match found");
    return;
  }

  // 1️ Create match in Firestore
  const matchId = await createMatch(matchData);

  // 2️ Save match to local state with IDs
  setMatches(prev => [
    ...prev,
    {
      id: matchId,
      requestId: matchData.request.id,
      offerId: matchData.offer.id,
      request: matchData.request,
      offer: matchData.offer,
      reasons: matchData.reasons,
      status: "proposed",
    },
  ]);

  console.log("Generated Match:", matchData);
  console.log("Match ID in Firestore:", matchId);
};

  // Accept a match
  const handleAcceptMatch = async (match: any) => {
    console.log("Accepting match:", match.id);
    await acceptMatch(match);

    // Update local state
    setMatches(prev =>
      prev.map(m => (m.id === match.id ? { ...m, status: "accepted" } : m))
    );

    console.log("Match accepted in Firestore");
  };

  // Reject a match
  const handleRejectMatch = async (match: any) => {
    console.log("Rejecting match:", match.id);
    await rejectMatch(match);

    // Update local state
    setMatches(prev =>
      prev.map(m => (m.id === match.id ? { ...m, status: "rejected" } : m))
    );

    console.log("Match rejected in Firestore");
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>Open Requests:</Text>
      {requests.map(r => (
        <Text key={r.id}>{r.title} - Urgency {r.urgency}</Text>
      ))}

      <Text style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}>Open Offers:</Text>
      {offers.map(o => (
        <Text key={o.id}>{o.title} - Qty {o.quantity}</Text>
      ))}

      <Button title="Generate Match" onPress={handleGenerateMatch} />

      <Text style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}>Generated Matches (for testing):</Text>
      {matches.map(m => (
        <View key={m.id} style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: "#ccc" }}>
          <Text>Offer: {m.offer.title}</Text>
          <Text>Request: {m.request.title}</Text>
          <Text>Status: {m.status}</Text>
          <Text>Reasons: {m.reasons?.join(", ")}</Text>
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            {m.status === "proposed" && (
              <>
                <Button title="Accept" onPress={() => handleAcceptMatch(m)} />
                <View style={{ width: 10 }} />
                <Button title="Reject" onPress={() => handleRejectMatch(m)} />
              </>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}