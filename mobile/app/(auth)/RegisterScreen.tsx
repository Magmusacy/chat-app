import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

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
    <>
      <View className="w-full max-w-sm space-y-4 flex gap-4">
        <TextInput
          className="w-100 h-16 pt-4 pb-4 border-b-2 border-blue-500 text-white bg-transparent mb-4"
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
        />
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

        <TextInput
          className="w-100 h-16 pt-4 pb-4 border-b-2 border-blue-500 text-white bg-transparent mb-4"
          placeholder="Password Confirmation"
          placeholderTextColor="#9ca3af"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry
        />

        <TouchableOpacity
          className="mt-4 w-full h-12 bg-blue-500 rounded-lg flex items-center justify-center active:bg-blue-700"
          onPress={() => {
            register(email, name, password, passwordConfirmation);
          }}
        >
          <Text className="text-white text-lg font-semibold">Register</Text>
        </TouchableOpacity>
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
    </>
  );
}
