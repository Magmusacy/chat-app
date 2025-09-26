import UserCard from "@/components/UserCard";
import UsersHeader from "@/components/UsersHeader";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { LegendList } from "@legendapp/list";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const { user } = useAuth();
  const { allUsers } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation();

  const filteredUsers = allUsers.filter((unfilteredUser) => {
    if (unfilteredUser.id === user?.id) return;
    if (!searchQuery.trim()) return user;
    return unfilteredUser.name.toLocaleLowerCase().includes(searchQuery.trim());
  });

  // This is being rendered twice always but for now it doesn't cause much problem so whatever
  useEffect(() => {
    navigation.setOptions({
      header: () => <UsersHeader handleSetSearchQuery={setSearchQuery} />,
    });
  }, [navigation, allUsers]);

  const handleUserPress = (recipientId: number) => {
    if (user?.id) {
      router.push({
        pathname: "/chat/[senderId]/[recipientId]",
        params: {
          senderId: String(user.id),
          recipientId: String(recipientId),
        },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {allUsers.length > 0 ? (
          <LegendList
            data={filteredUsers}
            keyExtractor={(item) => String(item.id)}
            estimatedItemSize={80}
            contentContainerClassName="pb-4 px-2"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  onPress={() => handleUserPress(item.id)}
                  activeOpacity={0.7}
                  style={{ marginBottom: 8 }}
                >
                  <UserCard cardUser={item} />
                </TouchableOpacity>
              );
            }}
            recycleItems={true}
            extraData={filteredUsers}
          />
        ) : allUsers.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" className="mb-4" />
            <Text className="text-white text-center">
              Finding available users...
            </Text>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-text text-center">
              No users found matching &quot;{searchQuery}&quot;
            </Text>
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              className="mt-3 bg-primary py-2 px-4 rounded-lg"
            >
              <Text className="text-white font-medium">Clear search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
