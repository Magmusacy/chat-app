import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen({
  setIsSignIn,
}: {
  setIsSignIn: (value: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login, errorMessage } = useAuth();

  return (
    <>
      <View className="w-full max-w-sm space-y-4 flex gap-4">
        <TextInput
          className="w-100 h-16 pt-4 pb-4 border-b-2 border-blue-500 text-white bg-transparent mb-4"
          placeholder="Username"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="w-100 h-16 pt-4 pb-4 border-b-2 border-blue-500 text-white bg-transparent mb-4"
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          className="mt-4 w-full h-12 bg-blue-500 rounded-lg flex items-center justify-center active:bg-blue-700"
          onPress={() => {
            login(name, password);
          }}
        >
          <Text className="text-white text-lg font-semibold">Log in</Text>
        </TouchableOpacity>
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
    </>
  );
}
