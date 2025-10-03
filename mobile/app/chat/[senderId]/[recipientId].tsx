import ChatMessages from "@/components/ChatMessages";
import { useWebSocket } from "@/context/WebSocketContext";
import { theme } from "@/theme";
import { Message } from "@/types/Message";
import api from "@/utils/api";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { formatLastSeen } from "@/utils/dates-format";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
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
  const user = useAuthenticatedUser();
  const { send, allUsers, latestMessages, clientRef, socketConnected } =
    useWebSocket();
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

  // uhh idk this is workaround but idk how to fix it xd
  const headerHeight = useHeaderHeight();
  useEffect(() => {
    trueHeaderHeight.current = headerHeight;
  }, []);

  useEffect(() => {
    if (!recipient) return;
    const latest = latestMessages.get(
      chatRoomIdResolver(user.id, recipient.id)
    );
    if (!latest || latest.senderId === user.id || latest.readStatus) return;
    send(
      "/app/chat.read-latest-message",
      JSON.stringify({ otherChatUser: recipient.id })
    );
  }, [recipient, latestMessages, user.id, send]);

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

        const response = await api.get(`/messages/${recipientId}`);
        const data = response.data;
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
    []
  );

  const handleRetry = () => {
    fetchMessages(params.senderId, params.recipientId, true);
  };

  const handleSendMessage = () => {
    const messageToSend = {
      content: message,
      senderId: user.id,
      recipientId: recipient!.id,
      chatRoomId: chatRoomIdResolver(user.id, recipient!.id),
    };

    send("/app/chat.send-message", JSON.stringify(messageToSend));

    const tempMessage = {
      ...messageToSend,
      id: Math.max(...allMessages.map((m) => m.id)) + 1,
      timestamp: new Date().toISOString(),
    };

    setAllMessages((prev) => [...prev, tempMessage]);
  };

  useEffect(() => {
    if (!socketConnected || !clientRef.current) {
      return;
    }

    fetchMessages(params.senderId, params.recipientId, true);

    const sub = clientRef.current.subscribe(
      `/user/queue/messages-from-${user.id}`,
      (message) => {
        const newMessage: Message = JSON.parse(message.body);
        setAllMessages((prev) => [...prev, newMessage]);
      }
    );

    return () => {
      sub?.unsubscribe();
    };
  }, [
    params.senderId,
    params.recipientId,
    fetchMessages,
    user.id,
    clientRef,
    socketConnected,
  ]);

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
            disabled={
              message.length === 0 || !socketConnected || !clientRef.current
            }
            className={`bg-primary w-14 h-14 rounded-full items-center justify-center ${
              message.length > 0 && socketConnected ? "" : "opacity-20"
            }`}
            onPress={handleSendMessage}
          >
            <Feather name="send" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
