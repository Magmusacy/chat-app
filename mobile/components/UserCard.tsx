import { OtherUser } from "@/types/OtherUser";
import { Text, View } from "react-native";

export default function UserCard({ user }: { user: OtherUser }) {
  const initials = user.name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <View className="flex-row items-center bg-[#23293a] rounded-lg p-4 m-2">
      <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
        <Text className="text-white font-bold text-lg">{initials}</Text>
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-white font-medium text-lg">{user.name}</Text>
      </View>

      <View className="ml-4 justify-end">
        <Text className="text-white font-medium text-lg">
          {user.isOnline ? (
            <Text className="color-green-500">online</Text>
          ) : (
            <Text className="color-red-500">offline</Text>
          )}
        </Text>
      </View>
    </View>
  );
}
