import { Message } from "@/types/Message";
import { formatTimestamp } from "@/utils/dates-format";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function ChatMessages({
  allMessages,
}: {
  allMessages: Message[];
}) {
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const user = useAuthenticatedUser();

  return (
    <>
      {allMessages.length > 0 ? (
        <FlatList
          data={allMessages}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (selectedMessageId === item.id) {
                  setSelectedMessageId(null);
                } else {
                  setSelectedMessageId(item.id);
                }
              }}
              className={`p-0.5 max-w-[80%] ${item.senderId === user.id ? "self-end" : "self-start"}`}
            >
              {selectedMessageId === item.id && (
                <Text
                  className={`text-textDim text-xs mb-1 ${
                    item.senderId === user.id ? "text-right mr-2" : "ml-2"
                  }`}
                >
                  {formatTimestamp(item.timestamp)}
                </Text>
              )}

              <View
                className={`p-3 rounded-2xl ${
                  item.senderId === user?.id
                    ? "bg-sentMessage"
                    : "bg-receivedMessage"
                }`}
              >
                <Text className="text-textBase">{item.content}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="p-5"
          showsVerticalScrollIndicator={false}
          inverted={true}
          extraData={selectedMessageId}
        />
      ) : (
        <View className="flex justify-center items-center flex-1 ">
          <Text className="text-white">No messages with this user yet</Text>
        </View>
      )}
    </>
  );
}
