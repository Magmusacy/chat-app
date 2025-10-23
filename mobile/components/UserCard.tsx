import { defaultImage } from "@/config";
import { useWebSocket } from "@/context/WebSocketContext";
import { OtherUser } from "@/types/OtherUser";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { formatLastSeen, formatMessageTime } from "@/utils/dates-format";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { Avatar } from "@kolking/react-native-avatar";
import { Text, View } from "react-native";

export default function UserCard({ cardUser }: { cardUser: OtherUser }) {
  const user = useAuthenticatedUser();
  const { latestMessages } = useWebSocket();

  const latestMessage = latestMessages.get(
    chatRoomIdResolver(user.id, cardUser.id)
  );

  const latestMessageStyle =
    latestMessage?.senderId === user.id
      ? "text-textMuted"
      : latestMessage?.readStatus
        ? "text-gray-300"
        : "text-white font-medium";

  return (
    <View className="flex-row bg-surface rounded-lg p-3">
      <View className="relative">
        <Avatar
          source={
            cardUser.profilePictureUrl
              ? { uri: cardUser.profilePictureUrl }
              : undefined
          }
          defaultSource={defaultImage}
        />

        <View
          className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-background ${
            cardUser.isOnline ? "bg-success" : "bg-textMuted"
          }`}
        />
      </View>

      <View className="flex-1 justify-center pl-3 h-16 ">
        <View>
          <Text className="text-white font-semibold text-lg">
            {cardUser.name}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <View className="flex-1 mr-2">
            {latestMessage ? (
              <View className="flex-row items-center">
                <View className="flex-row items-center flex-1 mr-2">
                  {latestMessage.senderId === user.id && (
                    <Text className="text-textMuted mr-1 text-sm">You: </Text>
                  )}
                  <Text
                    className={`text-sm flex-1 ${latestMessageStyle}`}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {latestMessage.content}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-textMuted">No messages yet</Text>
            )}
          </View>
        </View>
      </View>

      <View className="h-full flex justify-center py-1 pl-2 items-end">
        <Text
          className={`${cardUser.isOnline ? "text-success" : "text-textMuted"} text-xs`}
        >
          {cardUser.isOnline
            ? "Online"
            : cardUser.lastSeen
              ? `${formatLastSeen(cardUser.lastSeen)}`
              : "Offline"}
        </Text>
        {latestMessage?.timestamp && (
          <>
            <View className="w-full h-[1px] bg-border my-1.5"></View>
            <Text className={`text-xs ${latestMessageStyle}`}>
              {formatMessageTime(latestMessage.timestamp)}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
