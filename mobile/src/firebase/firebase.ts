import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQSRMPR6Z2-bNTheFGk7kQwhBSRsCn5ds",
  authDomain: "trueneed-95534.firebaseapp.com",
  projectId: "trueneed-95534",
  storageBucket: "trueneed-95534.firebasestorage.app",
  messagingSenderId: "450294261069",
  appId: "1:450294261069:web:6b1cb4b00c4b942d238304",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);