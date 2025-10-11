import { defaultImage } from "@/config";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import Feather from "@expo/vector-icons/Feather";
import { Avatar } from "@kolking/react-native-avatar";
import { Link } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface UsersHeaderParams {
  handleSetSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  title: string;
}

export default function UsersHeader({
  handleSetSearchQuery,
  title,
}: UsersHeaderParams) {
  const user = useAuthenticatedUser();
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <SafeAreaView edges={["top"]} className="bg-background">
      <View className="bg-background pt-2 px-4 border-b border-border">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-bold">{title}</Text>
          <Link href={`/user/${user.id}`} asChild>
            <TouchableOpacity className="flex-row items-center bg-surfaceLight rounded-full px-3 py-2 border border-border gap-4">
              <Text className="text-white font-medium ml-1">{user.name}</Text>
              <Avatar
                source={
                  user.profilePictureUrl
                    ? { uri: user.profilePictureUrl }
                    : undefined
                }
                defaultSource={defaultImage}
                size={40}
              />
            </TouchableOpacity>
          </Link>
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
