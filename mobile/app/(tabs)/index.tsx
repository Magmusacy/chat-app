import UsersHeader from "@/components/UsersHeader";
import UsersList from "@/components/UsersList";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const user = useAuthenticatedUser();
  const { logOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation();
  const { allUsers, latestMessages } = useWebSocket();

  const usersWithMessages = [...allUsers.values()].filter((u) => {
    const chatRoomId = chatRoomIdResolver(u.id, user.id);
    return latestMessages.has(chatRoomId) ? u : null;
  });

  const filteredUsers = usersWithMessages.filter((unfilteredUser) => {
    if (unfilteredUser.id === user.id) return;
    if (!searchQuery.trim()) return user;
    return unfilteredUser.name
      .toLocaleLowerCase()
      .includes(searchQuery.toLocaleLowerCase().trim());
  });

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <UsersHeader handleSetSearchQuery={setSearchQuery} title="Chats" />
      ),
    });
  }, [navigation, allUsers]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <UsersList list={filteredUsers} />
    </SafeAreaView>
  );
}
