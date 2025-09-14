import { Image, Text, View } from "react-native";

interface UserCardProps {
  name: string;
  avatar?: string;
}

export default function UserCard({ name, avatar }: UserCardProps) {
  // Get the initials from the name for the avatar fallback
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <View className="flex-row items-center bg-[#23293a] rounded-lg p-4 m-2">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-12 h-12 rounded-full bg-gray-700"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-gray-700 items-center justify-center">
          <Text className="text-white font-bold text-lg">{initials}</Text>
        </View>
      )}

      {/* User Name */}
      <View className="ml-4 flex-1">
        <Text className="text-white font-medium text-lg">{name}</Text>
      </View>
    </View>
  );
}
