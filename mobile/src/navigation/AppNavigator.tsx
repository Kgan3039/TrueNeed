import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateOfferScreen from "../screens/CreateOfferScreen";
import CreateRequestScreen from "../screens/CreateRequestScreen";


export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateOffer: undefined;
  CreateRequest: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();


export default function AppNavigator({ user }: any) {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />

            <Stack.Screen
              name="CreateOffer"
              component={CreateOfferScreen}
            />

            <Stack.Screen
              name="CreateRequest"
              component={CreateRequestScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />

            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}