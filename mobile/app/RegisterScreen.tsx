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

export default function RegisterScreen({
  setIsSignIn,
}: {
  setIsSignIn: (value: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const { register, errorMessage } = useAuth();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      className="flex-1 justify-center items-center p-6 bg-theme text-white"
    >
      <View className="w-full max-w-sm space-y-4 flex gap-4">
        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-white"
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
        />
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

        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg text-white"
          placeholder="Password Confirmation"
          placeholderTextColor="#9ca3af"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry
        />

        <View className="mt-4">
          <Button
            title="Register"
            color="#3b82f6"
            onPress={() => {
              register(email, name, password, passwordConfirmation);
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
        {"Already have an account? "}
        <Text
          onPress={() => setIsSignIn(true)}
          className="text-blue-300 underline"
        >
          Sign In
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
}
