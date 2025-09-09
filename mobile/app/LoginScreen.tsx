import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen({
  setIsSignIn,
}: {
  setIsSignIn: (value: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, errorMessage } = useAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      className="flex-1 justify-center items-center p-6 bg-theme text-white"
    >
      <View className="w-full max-w-sm space-y-4 flex gap-4">
        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-white"
          placeholder="Username"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-white"
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View className="mt-4">
          <Button
            title="Log in"
            color="#3b82f6"
            onPress={() => {
              login(name, password);
            }}
          />
        </View>
      </View>
      {errorMessage && (
        <View className="mt-4">
          <Text className="text-red-500">{errorMessage}</Text>
        </View>
      )}

      <Text className="text-white mt-10 text-xl">
        {"Don't have an account? "}
        <Text
          onPress={() => setIsSignIn(false)}
          className="text-blue-300 underline"
        >
          Sign Up
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}
