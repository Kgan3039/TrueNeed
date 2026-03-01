import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateOfferScreen from "../screens/CreateOfferScreen";
import CreateRequestScreen from "../screens/CreateRequestScreen";
import MatchInboxScreen from "../screens/MatchInboxScreen";
import DashboardScreen from "../screens/DashboardScreen";

export type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  CreateOffer: undefined;
  CreateRequest: undefined;
  MatchInbox: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isLoggedIn: boolean;
};

export default function AppNavigator({ isLoggedIn }: Props) {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "none",
        headerTitleAlign: "center",
      }}
    >
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
          <Stack.Screen name="CreateOffer" component={CreateOfferScreen} options={{ title: "TrueNeed" }} />
          <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: "TrueNeed" }} />
          <Stack.Screen name="MatchInbox" component={MatchInboxScreen} options={{ title: "TrueNeed" }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: "TrueNeed" }} />
        </>
      ) : (
        <>
          {/* 🔥 Signup FIRST */}
          <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}