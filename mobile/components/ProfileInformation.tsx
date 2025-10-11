import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/config";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface ProfileInformationProps {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  onShowNotification?: (
    type: "success" | "error" | "info",
    message: string
  ) => void;
}

interface FormErrors {
  nameTooShort: boolean;
  nameTooLong: boolean;
  passwordTooShort: boolean;
  passwordMismatch: boolean;
}

export default function ProfileInformation({
  isEditing,
  setIsEditing,
  fullName,
  setFullName,
  onShowNotification,
}: ProfileInformationProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    nameTooShort: false,
    nameTooLong: false,
    passwordTooShort: false,
    passwordMismatch: false,
  });
  const user = useAuthenticatedUser();
  const { setUser } = useAuth();

  const validateFullName = (name: string) => {
    const newErrors = { ...errors };
    newErrors.nameTooShort = name.length > 0 && name.length < MIN_NAME_LENGTH;
    newErrors.nameTooLong = name.length > MAX_NAME_LENGTH;
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const validatePassword = (pwd: string, confirmPwd: string) => {
    const isPasswordTooShort =
      pwd.length > 0 && pwd.length < MIN_PASSWORD_LENGTH;

    const hasPasswordMismatch =
      (pwd.length > 0 || confirmPwd.length > 0) && pwd !== confirmPwd;

    const newErrors = { ...errors };
    newErrors.passwordTooShort = isPasswordTooShort;
    newErrors.passwordMismatch = hasPasswordMismatch;

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const hasErrors = () => {
    return Object.values(errors).some((error) => error);
  };

  const handleSaveChanges = async () => {
    if (!validateFullName(fullName)) return;

    if (!validatePassword(password, passwordConfirmation)) return;

    try {
      const response = await api.post("/user/update", {
        name: fullName,
        password: password.length === 0 ? null : password,
        passwordConfirmation:
          passwordConfirmation.length === 0 ? null : passwordConfirmation,
      });

      const data = response.data;
      console.log(data);

      setUser({ ...user, name: fullName });
      setIsEditing(false);
      setPassword("");
      setPasswordConfirmation("");

      onShowNotification?.("success", "Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);

      onShowNotification?.(
        "error",
        "Failed to update profile. Please try again."
      );
    }
  };

  return (
    <View className="bg-surfaceLight rounded-2xl p-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-xl font-semibold">
          Profile Information
        </Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons
            name={isEditing ? "close" : "pencil"}
            size={20}
            color="#9CA3AF"
            className="p-2"
          />
        </TouchableOpacity>
      </View>

      <View className="space-y-4 gap-1">
        <View>
          <Text className="text-gray-400 text-sm mb-2">Full Name</Text>
          {isEditing ? (
            <View className="relative">
              <TextInput
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  validateFullName(text);
                }}
                className={`bg-background text-white text-lg p-3 rounded-xl ${
                  errors.nameTooShort || errors.nameTooLong
                    ? "border-2 border-red-500"
                    : ""
                }`}
                placeholderTextColor="#9CA3AF"
              />
              {(errors.nameTooShort || errors.nameTooLong) && (
                <View className="absolute right-3 top-0 bottom-0 justify-center">
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                </View>
              )}
            </View>
          ) : (
            <Text className="text-white text-lg">{user.name}</Text>
          )}
        </View>

        <View>
          <Text className="text-gray-400 text-sm mb-2">Email</Text>
          <Text className="text-white text-lg">{user.email}</Text>
        </View>

        {isEditing && (
          <>
            <View>
              <Text className="text-gray-400 text-sm mb-2">New Password</Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    validatePassword(text, passwordConfirmation);
                  }}
                  secureTextEntry
                  placeholder="Leave blank to keep current"
                  className={`bg-background text-white text-lg p-3 rounded-xl ${
                    errors.passwordTooShort ||
                    (errors.passwordMismatch && password.length > 0)
                      ? "border-2 border-red-500"
                      : ""
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {(errors.passwordTooShort ||
                  (errors.passwordMismatch && password.length > 0)) && (
                  <View className="absolute right-3 top-0 bottom-0 justify-center">
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  </View>
                )}
              </View>
            </View>

            <View>
              <Text className="text-gray-400 text-sm mb-2">
                Confirm Password
              </Text>
              <View className="relative">
                <TextInput
                  value={passwordConfirmation}
                  onChangeText={(text) => {
                    setPasswordConfirmation(text);
                    validatePassword(password, text);
                  }}
                  secureTextEntry
                  placeholder="Confirm new password"
                  className={`bg-background text-white text-lg p-3 rounded-xl ${
                    errors.passwordMismatch &&
                    (password.length > 0 || passwordConfirmation.length > 0)
                      ? "border-2 border-red-500"
                      : ""
                  }`}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.passwordMismatch &&
                  (password.length > 0 || passwordConfirmation.length > 0) && (
                    <View className="absolute right-3 top-0 bottom-0 justify-center">
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    </View>
                  )}
              </View>
            </View>

            {errors.nameTooShort && (
              <View className="px-3 py-2 flex-row items-center ">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text className="text-red-500 ml-2 flex-1 text-sm">
                  Name must be at least {MIN_NAME_LENGTH} characters
                </Text>
              </View>
            )}
            {errors.nameTooLong && (
              <View className="px-3 py-2 flex-row items-center ">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text className="text-red-500 ml-2 flex-1 text-sm">
                  Name must be no more than {MAX_NAME_LENGTH} characters
                </Text>
              </View>
            )}
            {errors.passwordTooShort && (
              <View className="px-3 py-2 flex-row items-center ">
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text className="text-red-500 ml-2 flex-1 text-sm">
                  Password must be at least {MIN_PASSWORD_LENGTH} characters
                </Text>
              </View>
            )}
            {errors.passwordMismatch &&
              (password.length > 0 || passwordConfirmation.length > 0) && (
                <View className="px-3 py-2 flex-row items-center ">
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text className="text-red-500 ml-2 flex-1 text-sm">
                    Passwords do not match
                  </Text>
                </View>
              )}
          </>
        )}
      </View>

      {isEditing && (
        <TouchableOpacity
          onPress={handleSaveChanges}
          disabled={hasErrors()}
          className={`rounded-xl p-4 mt-6 items-center ${
            hasErrors()
              ? "bg-gray-600 opacity-50"
              : "bg-primary"
          }`}
        >
          <Text className="text-white font-semibold text-base">
            Save Changes
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
