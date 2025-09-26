import { useAuth } from "@/context/AuthContext";
import { Message } from "@/types/Message";
import { LegendList } from "@legendapp/list";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

// interface ChatMessageProps {
//   message: Message;
//   selectedMessageId: number | null;
//   setSelectedMessageId: React.Dispatch<React.SetStateAction<number | null>>;
// }

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  // Format: "Today, 3:45 PM" or "Yesterday, 3:45 PM" or "Sep 24, 3:45 PM"
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const timeString = date.toLocaleTimeString(undefined, timeOptions);

  // Check if date is today, yesterday, or earlier
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeString}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeString}`;
  } else {
    // Format: "Sep 24"
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    const dateString = date.toLocaleDateString(undefined, dateOptions);
    return `${dateString}, ${timeString}`;
  }
};

export default function ChatMessages({
  allMessages,
}: {
  allMessages: Message[];
}) {
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(
    null
  );
  const { user } = useAuth();

  return (
    <>
      {allMessages.length > 0 ? (
        <LegendList
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
              className={`p-2 max-w-[80%] ${item.senderId === user?.id ? "self-end" : "self-start"}`}
            >
              {selectedMessageId === item.id && (
                <Text
                  className={`text-textDim text-xs mb-1 ${
                    item.senderId === user?.id ? "text-right mr-2" : "ml-2"
                  }`}
                >
                  {formatTimestamp(item.timestamp)}
                </Text>
              )}

              <View
                className={`p-3 rounded-2xl ${
                  item.senderId === user?.id
                    ? "bg-sentMessage rounded-tr-none"
                    : "bg-receivedMessage rounded-tl-none"
                }`}
              >
                <Text className="text-textBase">{item.content}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="p-5"
          alignItemsAtEnd
          maintainScrollAtEnd
          maintainScrollAtEndThreshold={0.5}
          maintainVisibleContentPosition
          recycleItems={false}
          estimatedItemSize={320}
          initialScrollIndex={allMessages.length}
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
