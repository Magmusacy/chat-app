import UsersHeader from "@/components/UsersHeader";
import UsersList from "@/components/UsersList";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const { user } = useAuth();
  const { allUsers, latestMessages } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation();

  const usersWithoutMessages = allUsers.filter((u) => {
    const chatRoomId = chatRoomIdResolver(u.id, user!.id);
    return latestMessages.has(chatRoomId) ? null : u;
  });

  const filteredUsers = usersWithoutMessages.filter((unfilteredUser) => {
    // this is here but I want to make it impossible to message myself in the future
    if (unfilteredUser.id === user?.id) return false;
    if (!searchQuery.trim()) return true;

    return unfilteredUser.name
      .toLocaleLowerCase()
      .includes(searchQuery.toLocaleLowerCase().trim());
  });

  // This is being rendered twice always but for now it doesn't cause much problem so whatever
  useEffect(() => {
    navigation.setOptions({
      header: () => <UsersHeader handleSetSearchQuery={setSearchQuery} />,
    });
  }, [navigation, usersWithoutMessages]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <UsersList list={filteredUsers} />
    </SafeAreaView>
  );
}
