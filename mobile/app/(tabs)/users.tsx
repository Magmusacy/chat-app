import UserCard from "@/components/UserCard";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Users() {
  const { user } = useAuth();
  const [error] = useState<string | null>(null);
  const { allUsers } = useWebSocket();

  return (
    <SafeAreaView className="flex-1 bg-theme">
      <ScrollView showsVerticalScrollIndicator={false}>
        {error && <Text style={{ color: "red" }}>{error}</Text>}
        {allUsers.length > 0 ? (
          allUsers.map((userItem) => (
            <TouchableOpacity
              key={userItem.id}
              onPress={() => {
                router.push({
                  pathname: "/chat/[senderId]/[recipientId]",
                  params: {
                    senderId: String(user!.id),
                    recipientId: String(userItem.id),
                  },
                });
              }}
            >
              <UserCard user={userItem} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: "white" }}>No users found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
