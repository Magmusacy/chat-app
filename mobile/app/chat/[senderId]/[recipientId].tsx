import ChatMessages from "@/components/ChatMessages";
import { API_URL } from "@/config";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/context/WebSocketContext";
import { theme } from "@/theme";
import { Message } from "@/types/Message";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { formatLastSeen } from "@/utils/dates-format";
import Feather from "@expo/vector-icons/Feather";
import { useHeaderHeight } from "@react-navigation/elements";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";

interface Params {
  senderId: number;
  recipientId: number;
}

interface ErrorState {
  hasError: boolean;
  message: string;
}

export default function Chat() {
  const { senderId, recipientId } = useLocalSearchParams();
  const { user } = useAuth();
  const { client, allUsers, latestMessages } = useWebSocket();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [message, setMessage] = useState<string>("");
  const navigation = useNavigation();
  const trueHeaderHeight = useRef<number>(0);
  const params: Params = {
    senderId: Array.isArray(senderId)
      ? parseInt(senderId[0], 10)
      : parseInt(senderId, 10),
    recipientId: Array.isArray(recipientId)
      ? parseInt(recipientId[0], 10)
      : parseInt(recipientId, 10),
  };
  const recipient = allUsers.find((user) => user.id === params.recipientId);
  const latestMessage = allMessages[allMessages.length - 1];

  // uhh idk this is workaround but idk how to fix it xd
  const headerHeight = useHeaderHeight();
  useEffect(() => {
    trueHeaderHeight.current = headerHeight;
  }, []);

  useEffect(() => {
    if (!client || !user || !recipient) return;
    const latestMessage = latestMessages.get(
      chatRoomIdResolver(user.id, recipient.id)
    );
    if (!latestMessage || latestMessage.senderId === user.id) return;
    client.publish({
      destination: "/app/chat.read-latest-message",
      body: JSON.stringify({
        otherChatUser: recipient.id,
      }),
    });
  }, [client, user, latestMessage, recipient]);

  useEffect(() => {
    if (!recipient) return;
    navigation.setOptions({
      headerTitle: () => (
        <View className="flex-col items-start w-full pl-2">
          <Text className="text-white font-bold text-lg">{recipient.name}</Text>
          <View className="flex-row items-center">
            <View
              className={`w-2 h-2 rounded-full mr-1 ${
                recipient.isOnline ? "bg-success" : "bg-textMuted"
              }`}
            />
            <Text className="text-textMuted text-xs">
              {recipient.isOnline
                ? "Online"
                : recipient.lastSeen
                  ? `Last seen ${formatLastSeen(recipient.lastSeen)}`
                  : "Offline"}
            </Text>
          </View>
        </View>
      ),
    });
  }, [recipient, navigation]);

  const fetchMessages = useCallback(
    async (senderId: number, recipientId: number, isRetry = false) => {
      try {
        if (isRetry) setIsRetrying(true);
        setError(null);

        const response = await fetch(`${API_URL}/messages/${recipientId}`, {
          headers: {
            Authorization: `Bearer ${user!.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAllMessages(Array.isArray(data) ? data : []);
      } catch {
        console.error("Error fetching messages");

        setError({
          hasError: true,
          message: "Couldn't load the messages",
        });
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    },
    [user]
  );

  const handleRetry = () => {
    fetchMessages(params.senderId, params.recipientId, true);
  };

  const handleSendMessage = () => {
    const messageToSend = {
      content: message,
      senderId: user!.id,
      recipientId: recipient!.id,
      chatRoomId: chatRoomIdResolver(user!.id, recipient!.id),
    };

    client?.publish({
      destination: "/app/chat.send-message",
      body: JSON.stringify(messageToSend),
    });

    const tempMessage = {
      ...messageToSend,
      id: Math.max(...allMessages.map((m) => m.id)) + 1,
      timestamp: new Date().toISOString(),
    };

    setAllMessages((prev) => [...prev, tempMessage]);
  };

  useEffect(() => {
    if (client) {
      fetchMessages(params.senderId, params.recipientId, true);
      client.subscribe(`/user/queue/messages-from-${user!.id}`, (message) => {
        const newMessage: Message = JSON.parse(message.body);
        setAllMessages((prev) => [...prev, newMessage]);
      });
    } else if (!client) {
      setIsLoading(false);
      setError({
        hasError: true,
        message: "Couldn't connect to server",
      });
    }

    return () => {
      client!.unsubscribe(`/user/chat/${recipient!.id}`);
    };
  }, [client, params.senderId, params.recipientId, fetchMessages]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-theme justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-white mt-4">Loading messages...</Text>
      </SafeAreaView>
    );
  }

  if (error?.hasError) {
    return (
      <SafeAreaView className="flex-1 bg-theme justify-center items-center p-6">
        <View className="bg-red-900/20 border border-red-500 rounded-lg p-6 w-full max-w-sm">
          <Text className="text-white mb-4">{error.message}</Text>

          <TouchableOpacity
            onPress={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 rounded-lg py-3 px-6 disabled:opacity-50"
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-semibold">
                Try again
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={trueHeaderHeight.current}
      >
        <View className="flex-1 bg-background">
          <ChatMessages allMessages={allMessages} />
        </View>

        <View className="p-4 border-t border-borderLight/30 bg-surface flex flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-surfaceLight rounded-full border border-border/50 px-4">
            <TextInput
              className="flex-1 h-14 text-textBase text-xl"
              placeholder="Type your message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity className="ml-2">
              <Feather
                name="paperclip"
                size={20}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            disabled={message.length === 0}
            className={`bg-primary w-14 h-14 rounded-full items-center justify-center ${message.length > 0 ? "" : "opacity-20"}`}
            onPress={handleSendMessage}
          >
            <Feather name="send" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
