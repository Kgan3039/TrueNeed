import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import  LoginScreen from "../screens/LoginScreen";
import  SignupScreen from "../screens/SignupScreen";
import  HomeScreen  from "../screens/HomeScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator({ isAuthed }: { isAuthed: boolean }) {
  return (
    <Stack.Navigator>
      {!isAuthed ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        <Stack.Screen name="Home" component={HomeScreen} />
      )}
    </Stack.Navigator>
  );
}