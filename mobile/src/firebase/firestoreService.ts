import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";


// -----------------------------
// FETCH OPEN DATA
// -----------------------------

export async function fetchOpenRequests() {
  const q = query(collection(db, "requests"), where("status", "==", "open"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function fetchOpenOffers() {
  const q = query(collection(db, "offers"), where("status", "==", "open"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}


// -----------------------------
// MATCH LOGIC
// -----------------------------

export function generateMatch(requests: any[], offers: any[]) {
  if (!requests?.length || !offers?.length) return null;

  const sorted = [...requests].sort(
    (a, b) => (b?.urgency || 0) - (a?.urgency || 0)
  );

  for (const request of sorted) {
    if (!request?.id || !request?.category) continue;

    const offer = offers.find(
      (o) =>
        o?.id &&
        o?.category === request.category &&
        o?.ownerUid !== request.ownerUid &&
        o?.status === "open"
    );

    if (offer) {
      return {
        request,
        offer,
        reasons: [
          `High urgency (${request.urgency || 0}/5)`,
          "Category match",
        ],
      };
    }
  }

  return null;
}


// -----------------------------
// CREATE MATCH
// -----------------------------

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

// -----------------------------
// UPDATE MATCH STATUS
// -----------------------------

export async function setMatchStatus(
  matchId: string,
  status: "proposed" | "accepted" | "rejected"
) {
  if (!matchId) return;

  const matchRef = doc(db, "matches", matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) return;

  const matchData: any = matchSnap.data();

  await updateDoc(matchRef, { status });

  if (status === "accepted") {
    if (matchData.offerId) {
      await updateDoc(doc(db, "offers", matchData.offerId), {
        status: "matched",
      });
    }

    if (matchData.requestId) {
      await updateDoc(doc(db, "requests", matchData.requestId), {
        status: "matched",
      });
    }
  }
}