import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateOfferScreen from "../screens/CreateOfferScreen";
import CreateRequestScreen from "../screens/CreateRequestScreen";

//Pratham screens (adjust paths/names to match your repo)
import MatchInboxScreen from "../screens/MatchInboxScreen";
import DashboardScreen from "../screens/DashboardScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateOffer: undefined;
  CreateRequest: undefined;

  MatchInbox: { currentUid: string };
  Dashboard: { currentUid: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ user }: { user: any }) {
  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateOffer" component={CreateOfferScreen} />
          <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
          <Stack.Screen name="MatchInbox" component={MatchInboxScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}