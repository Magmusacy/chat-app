import { useAuth } from "@/context/AuthContext";
import { OtherUser } from "@/types/OtherUser";
import { LegendList } from "@legendapp/list";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import UserCard from "./UserCard";

export default function UsersList({ list }: { list: OtherUser[] }) {
  const { user } = useAuth();
  const router = useRouter();

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
    <View className="flex-1">
      {list.length > 0 ? (
        <LegendList
          data={list}
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
          extraData={list}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-white text-center">No users found</Text>
        </View>
      )}
    </View>
  );
}
