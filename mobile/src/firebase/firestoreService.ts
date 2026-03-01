import { collection, query, where, getDocs, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // adjust if firebase.ts is elsewhere

// Fetch open requests
export async function fetchOpenRequests() {
  const q = query(collection(db, "requests"), where("status", "==", "open"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Fetch open offers
export async function fetchOpenOffers() {
  const q = query(collection(db, "offers"), where("status", "==", "open"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Simple client-side matching logic
export function generateMatch(requests: any[], offers: any[]) {
  if (!requests?.length || !offers?.length) return null;

  // Sort requests by urgency (default 0 if missing)
  const sortedRequests = [...requests].sort((a, b) => (b.urgency || 0) - (a.urgency || 0));

  for (let request of sortedRequests) {
    if (!request.category) continue; // skip if no category

    const matchingOffer = offers.find(
      o => o.category && o.category === request.category && o.ownerUid && o.ownerUid !== request.ownerUid
    );

    if (matchingOffer) {
      return {
        request,
        offer: matchingOffer,
        reasons: [`High urgency (${request.urgency || 0}/5)`, "Category match"]
      };
    }
  }

  return null;
}

// Create a match document
export async function createMatch(matchData: { request: any; offer: any; reasons?: string[] }) {
  const { request, offer, reasons } = matchData;

  const docRef = await addDoc(collection(db, "matches"), {
    offerId: offer?.id ?? "",
    requestId: request?.id ?? "",
    offerTitle: offer?.title ?? "No title",
    requestTitle: request?.title ?? "No title",
    offerOwnerUid: offer?.ownerUid ?? "",
    requestOwnerUid: request?.ownerUid ?? "",
    score: request?.urgency ?? 0,
    reasons: reasons ?? ["No reasons"],
    status: "proposed",
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// Accept a match
export async function acceptMatch(match: any) {
  if (!match?.id || !match.offerId || !match.requestId) {
    console.error("Cannot accept match: missing IDs", match);
    return;
  }

  const matchRef = doc(db, "matches", match.id);
  const offerRef = doc(db, "offers", match.offerId);
  const requestRef = doc(db, "requests", match.requestId);

  try {
    await updateDoc(matchRef, { status: "accepted" });
    await updateDoc(offerRef, { status: "matched" });
    await updateDoc(requestRef, { status: "matched" });
    console.log("Match accepted successfully:", match.id);
  } catch (error) {
    console.error("Error accepting match:", error);
  }
}

// Reject a match
export async function rejectMatch(match: any) {
  const matchRef = doc(db, "matches", match.id);
  await updateDoc(matchRef, { status: "rejected" });
}