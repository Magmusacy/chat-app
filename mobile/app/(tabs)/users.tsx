import UserCard from "@/components/UserCard";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const { user, isLoadingUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { allUsers } = useWebSocket();

  return (
    <SafeAreaView className="flex-1 bg-theme">
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      {allUsers.length > 0 ? (
        allUsers.map((user) => <UserCard key={user.id} user={user} />)
      ) : (
        <Text style={{ color: "white" }}>No users found</Text>
      )}
    </SafeAreaView>
  );
}
