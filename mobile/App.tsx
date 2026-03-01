import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./src/firebase/firebase";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return <AppNavigator user={user} />;
}