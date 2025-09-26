import UsersHeader from "@/components/UsersHeader";
import UsersList from "@/components/UsersList";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, logOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation();
  const { allUsers, latestMessages } = useWebSocket();

  const usersWithMessages = allUsers.filter((u) => {
    const chatRoomId = chatRoomIdResolver(u.id, user!.id);
    return latestMessages.has(chatRoomId) ? u : null;
  });

  const filteredUsers = usersWithMessages.filter((unfilteredUser) => {
    if (unfilteredUser.id === user?.id) return;
    if (!searchQuery.trim()) return user;
    return unfilteredUser.name
      .toLocaleLowerCase()
      .includes(searchQuery.toLocaleLowerCase().trim());
  });

  // This is being rendered twice always but for now it doesn't cause much problem so whatever
  useEffect(() => {
    navigation.setOptions({
      header: () => <UsersHeader handleSetSearchQuery={setSearchQuery} />,
    });
  }, [navigation, allUsers]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View>
        <TouchableOpacity onPress={logOut}>
          <Text className="text-white">wyloguj</Text>
        </TouchableOpacity>
      </View>
      <UsersList list={filteredUsers} />
    </SafeAreaView>
  );
}
