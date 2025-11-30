import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/config";
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
  emailInvalid: boolean;
  nameTooShort: boolean;
  nameTooLong: boolean;
  passwordTooShort: boolean;
  passwordMismatch: boolean;
}

export default function RegisterScreen({
  setIsSignIn,
}: {
  setIsSignIn: (value: boolean) => void;
}) {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({
    emailInvalid: false,
    nameTooShort: false,
    nameTooLong: false,
    passwordTooShort: false,
    passwordMismatch: false,
  });
  const { register, errorMessage, isLoadingUser, clearError } = useAuth();

  const validateEmail = (value: string) => {
    const newErrors = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    newErrors.emailInvalid = value.length > 0 && !emailRegex.test(value);
    setErrors(newErrors);
  };

  const validateName = (value: string) => {
    const newErrors = { ...errors };
    newErrors.nameTooShort = value.length > 0 && value.length < MIN_NAME_LENGTH;
    newErrors.nameTooLong = value.length > MAX_NAME_LENGTH;
    setErrors(newErrors);
  };

  const validatePassword = (pwd: string, confirmPwd: string) => {
    const newErrors = { ...errors };
    newErrors.passwordTooShort =
      pwd.length > 0 && pwd.length < MIN_PASSWORD_LENGTH;
    newErrors.passwordMismatch =
      (pwd.length > 0 || confirmPwd.length > 0) && pwd !== confirmPwd;
    setErrors(newErrors);
  };

  const hasErrors = () => {
    return Object.values(errors).some((error) => error);
  };

  const handleRegister = () => {
    if (
      !hasErrors() &&
      email.trim() &&
      name.trim() &&
      password.trim() &&
      passwordConfirmation.trim()
    ) {
      register(email, name, password, passwordConfirmation);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="w-full"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      enableAutomaticScroll={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={20}
    >
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-sm space-y-4 flex gap-4">
          <View>
            <Text className="text-gray-400 text-sm mb-2">Email</Text>
            <View className="relative">
              <TextInput
                className={`w-full bg-surfaceLight text-white text-lg p-4 rounded-xl ${
                  errors.emailInvalid ? "border-2 border-red-500" : ""
                }`}
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  validateEmail(text);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.emailInvalid && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2">Username</Text>
            <View className="relative">
              <TextInput
                className={`w-full bg-surfaceLight text-white text-lg p-4 rounded-xl ${
                  errors.nameTooShort || errors.nameTooLong
                    ? "border-2 border-red-500"
                    : ""
                }`}
                placeholder="Enter your username"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  validateName(text);
                }}
                autoCapitalize="none"
              />
              {(errors.nameTooShort || errors.nameTooLong) && (
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
                  errors.passwordTooShort || errors.passwordMismatch
                    ? "border-2 border-red-500"
                    : ""
                }`}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  validatePassword(text, passwordConfirmation);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {(errors.passwordTooShort || errors.passwordMismatch) && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          </View>

          <View>
            <Text className="text-gray-400 text-sm mb-2">Confirm Password</Text>
            <View className="relative">
              <TextInput
                className={`w-full bg-surfaceLight text-white text-lg p-4 rounded-xl ${
                  errors.passwordMismatch ? "border-2 border-red-500" : ""
                }`}
                placeholder="Confirm your password"
                placeholderTextColor="#9ca3af"
                value={passwordConfirmation}
                onChangeText={(text) => {
                  setPasswordConfirmation(text);
                  validatePassword(password, text);
                }}
                secureTextEntry
                autoCapitalize="none"
              />
              {errors.passwordMismatch && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          </View>

          {errors.emailInvalid && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Please enter a valid email address
              </Text>
            </View>
          )}
          {errors.nameTooShort && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Username must be at least {MIN_NAME_LENGTH} characters
              </Text>
            </View>
          )}
          {errors.nameTooLong && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Username must be no more than {MAX_NAME_LENGTH} characters
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
          {errors.passwordMismatch && (
            <View className="px-3 py-2 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1 text-sm">
                Passwords do not match
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
              hasErrors() ||
              !email.trim() ||
              !name.trim() ||
              !password.trim() ||
              !passwordConfirmation.trim()
                ? "bg-gray-600 opacity-50"
                : "bg-primary active:bg-blue-700"
            }`}
            onPress={handleRegister}
            disabled={
              hasErrors() ||
              !email.trim() ||
              !name.trim() ||
              !password.trim() ||
              !passwordConfirmation.trim()
            }
          >
            <Text className="text-white text-lg font-semibold">Register</Text>
          </TouchableOpacity>
          {isLoadingUser && <ActivityIndicator size="large" color="#3b82f6" />}
        </View>

        <Text className="text-white mt-10 text-base">
          {"Already have an account? "}
          <Text
            onPress={() => {
              clearError();
              setIsSignIn(true);
            }}
            className="text-primary font-semibold"
          >
            Sign In
          </Text>
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
}
