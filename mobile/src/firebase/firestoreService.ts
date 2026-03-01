import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";


// ----------------------
// FETCH FUNCTIONS
// ----------------------

export async function fetchOpenRequests() {
  const q = query(collection(db, "requests"), where("status", "==", "open"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function fetchOpenOffers() {
  const q = query(collection(db, "offers"), where("status", "==", "open"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}


// ----------------------
// MATCH LOGIC
// ----------------------

export function generateMatch(requests: any[], offers: any[]) {
  if (!requests?.length || !offers?.length) return null;

  const sortedRequests = [...requests].sort(
    (a, b) => (b?.urgency || 0) - (a?.urgency || 0)
  );

  for (const request of sortedRequests) {
    if (!request?.id || !request?.category) continue;

    const matchingOffer = offers.find(
      (offer) =>
        offer?.id &&
        offer?.category &&
        offer.category === request.category &&
        offer.ownerUid !== request.ownerUid &&
        offer.status === "open"
    );

    if (matchingOffer) {
      return {
        request,
        offer: matchingOffer,
        reasons: [
          `High urgency (${request.urgency || 0}/5)`,
          "Category match",
        ],
      };
    }
  }

  return null;
}


// ----------------------
// CREATE MATCH
// ----------------------

export async function createMatch(matchData: {
  request: any;
  offer: any;
  reasons?: string[];
}) {
  if (!matchData?.request?.id || !matchData?.offer?.id) {
    console.log("Invalid match data", matchData);
    return null;
  }

  const docRef = await addDoc(collection(db, "matches"), {
    offerId: matchData.offer.id,
    requestId: matchData.request.id,
    offerTitle: matchData.offer.title || "",
    requestTitle: matchData.request.title || "",
    offerOwnerUid: matchData.offer.ownerUid || "",
    requestOwnerUid: matchData.request.ownerUid || "",
    score: matchData.request.urgency || 0,
    reasons: matchData.reasons || [],
    status: "proposed",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}


// ----------------------
// ACCEPT MATCH
// ----------------------

export async function acceptMatch(match: any) {
  if (!match?.id || !match?.offerId || !match?.requestId) {
    console.log("Missing match IDs", match);
    return;
  }

  try {
    await updateDoc(doc(db, "matches", match.id), {
      status: "accepted",
    });

    await updateDoc(doc(db, "offers", match.offerId), {
      status: "matched",
    });

    await updateDoc(doc(db, "requests", match.requestId), {
      status: "matched",
    });

    console.log("Match accepted:", match.id);
  } catch (error) {
    console.log("Accept failed:", error);
  }
}


// ----------------------
// REJECT MATCH
// ----------------------

export async function rejectMatch(match: any) {
  if (!match?.id) {
    console.log("Missing match id");
    return;
  }

  try {
    await updateDoc(doc(db, "matches", match.id), {
      status: "rejected",
    });

    console.log("Match rejected:", match.id);
  } catch (error) {
    console.log("Reject failed:", error);
  }
}