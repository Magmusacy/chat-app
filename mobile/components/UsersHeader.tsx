import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UsersHeaderParams {
  handleSetSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export default function UsersHeader({
  handleSetSearchQuery,
}: UsersHeaderParams) {
  const user = useAuthenticatedUser();
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <SafeAreaView edges={["top"]} className="bg-background ">
      <View className="bg-background px-4 pb-2 border-b border-border">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-bold">Users</Text>
          {user && (
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-surfaceLight items-center justify-center mr-2">
                <Text className="text-white font-bold">
                  {user.name?.substring(0, 1).toUpperCase()}
                </Text>
              </View>
              <Text className="text-white">{user.name}</Text>
            </View>
          )}
        </View>

        <View className="bg-surfaceLight rounded-lg flex-row items-center px-3 border border-border mb-2">
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 py-2 px-2 text-white"
            placeholder="Search users..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSetSearchQuery(text);
            }}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                handleSetSearchQuery("");
              }}
              className="p-1"
            >
              <Feather name="x" size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
