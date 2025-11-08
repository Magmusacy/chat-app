import { MIN_NAME_LENGTH, MIN_PASSWORD_LENGTH } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface FormErrors {
  nameTooShort: boolean;
  passwordTooShort: boolean;
}

export default function LoginScreen({
  setIsSignIn,
}: {
  setIsSignIn: (value: boolean) => void;
}) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({
    nameTooShort: false,
    passwordTooShort: false,
  });
  const { login, errorMessage, isLoadingUser } = useAuth();

  const validateName = (value: string) => {
    const newErrors = { ...errors };
    newErrors.nameTooShort = value.length > 0 && value.length < MIN_NAME_LENGTH;
    setErrors(newErrors);
  };

  const validatePassword = (value: string) => {
    const newErrors = { ...errors };
    newErrors.passwordTooShort =
      value.length > 0 && value.length < MIN_PASSWORD_LENGTH;
    setErrors(newErrors);
  };

  const hasErrors = () => {
    return Object.values(errors).some((error) => error);
  };

  const handleLogin = () => {
    if (!hasErrors()) {
      login(email.trim(), password.trim());
    }
  };

  return (
    <KeyboardAwareScrollView
      className="w-full"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-sm space-y-4 flex gap-4">
          <View>
            <Text className="text-gray-400 text-sm mb-2">Email</Text>
            <View className="relative">
              <TextInput
                className={`w-full bg-surfaceLight text-white text-lg p-4 rounded-xl ${
                  errors.nameTooShort ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter your username"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateName(text);
                }}
                autoCapitalize="none"
              />
              {errors.nameTooShort && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2">Password</Text>
            <View className="relative">
              <TextInput
                className={`w-full bg-surfaceLight text-white text-lg p-4 rounded-xl ${
                  errors.passwordTooShort ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.passwordTooShort && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          </View>

          {errors.nameTooShort && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Username must be at least {MIN_NAME_LENGTH} characters
              </Text>
            </View>
          )}
          {errors.passwordTooShort && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Password must be at least {MIN_PASSWORD_LENGTH} characters
              </Text>
            </View>
          )}
          {errorMessage && (
            <View className="px-3 py-2 flex-row items-center bg-red-500/10 rounded-xl border border-red-500/30">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                {errorMessage}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`mt-4 w-full h-14 rounded-xl flex items-center justify-center ${
              hasErrors() || !email.trim() || !password.trim()
                ? "bg-gray-600 opacity-50"
                : "bg-primary active:bg-blue-700"
            }`}
            onPress={handleLogin}
            disabled={hasErrors() || !email.trim() || !password.trim()}
          >
            <Text className="text-white text-lg font-semibold">Log in</Text>
          </TouchableOpacity>
          {isLoadingUser && <ActivityIndicator size="large" color="#3b82f6" />}
        </View>

        <Text className="text-white mt-10 text-base">
          {"Don't have an account? "}
          <Text
            onPress={() => setIsSignIn(false)}
            className="text-primary font-semibold"
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}
