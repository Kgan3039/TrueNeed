import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function acceptMatch(params: {
  matchId: string;
  offerId: string;
  requestId: string;
}) {
  const { matchId, offerId, requestId } = params;

  // 1) match -> accepted
  await updateDoc(doc(db, "matches", matchId), {
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });

  // 2) offer/request -> matched
  await updateDoc(doc(db, "offers", offerId), { status: "matched" });
  await updateDoc(doc(db, "requests", requestId), { status: "matched" });

  // 3) create handoff record
  await addDoc(collection(db, "handoffs"), {
    matchId,
    offerId,
    requestId,
    status: "scheduled",
    pickupDetails: { time: null, placeText: "" },
    messages: [],
    createdAt: serverTimestamp(),
  });
}