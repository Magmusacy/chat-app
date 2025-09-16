import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

export default function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState<boolean>(true);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#23293a" }}
    >
      <SafeAreaView
        edges={["top"]}
        style={{ marginBottom: 0, paddingBottom: 0 }}
        className="flex-1 justify-center items-center p-6 bg-theme text-white"
      >
        {isSignIn ? (
          <LoginScreen setIsSignIn={setIsSignIn}></LoginScreen>
        ) : (
          <RegisterScreen setIsSignIn={setIsSignIn}></RegisterScreen>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
