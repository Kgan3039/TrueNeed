import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { NavigationContainer } from "@react-navigation/native";

import { auth } from "./src/firebase/firebase";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
}