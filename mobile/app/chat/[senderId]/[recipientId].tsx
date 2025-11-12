import ChatMessages from "@/components/ChatMessages";
import { defaultImage } from "@/config";
import { useWebSocket } from "@/context/WebSocketContext";
import { theme } from "@/theme";
import { Message } from "@/types/Message";
import api from "@/utils/api";
import { chatRoomIdResolver } from "@/utils/chat-path-resolver";
import { formatLastSeen } from "@/utils/dates-format";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import Feather from "@expo/vector-icons/Feather";
import { Avatar } from "@kolking/react-native-avatar";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface Params {
  senderId: number;
  recipientId: number;
}

interface ErrorState {
  hasError: boolean;
  message: string;
}

const PADDING_BOTTOM = 0;

function useGradualAnimation() {
  const height = useSharedValue(PADDING_BOTTOM);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        height.value = Math.max(e.height, PADDING_BOTTOM);
      },
      onEnd: (e) => {
        "worklet";
        height.value = e.height;
      },
    },
    []
  );

  return { height };
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
  const router = useRouter();
  const params: Params = {
    senderId: Array.isArray(senderId)
      ? parseInt(senderId[0], 10)
      : parseInt(senderId, 10),
    recipientId: Array.isArray(recipientId)
      ? parseInt(recipientId[0], 10)
      : parseInt(recipientId, 10),
  };
  const recipient = allUsers.get(params.recipientId);
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
      marginBottom: height.value > 0 ? 0 : PADDING_BOTTOM,
    };
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
        <View className="flex-row items-center w-full pl-2 gap-3">
          <Avatar
            source={
              recipient.profilePictureUrl
                ? { uri: recipient.profilePictureUrl }
                : undefined
            }
            defaultSource={defaultImage}
            size={40}
          />
          <View className="flex-col items-start flex-1">
            <Text className="text-white font-bold text-lg">
              {recipient.name}
            </Text>
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
          <TouchableOpacity
            onPress={() =>
              router.push(`/videoCall/${params.recipientId}?type=call` as any)
            }
            className="w-12 h-12 rounded-full items-center justify-center bg-primary"
          >
            <Feather name="video" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [recipient, navigation, router, params.recipientId]);

  const fetchMessages = useCallback(
    async (recipientId: number, isRetry = false) => {
      try {
        if (isRetry) setIsRetrying(true);
        setError(null);

        const response = await api.get(`/messages/${recipientId}`);
        const data = response.data as Message[];
        data.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setAllMessages(data);
      } catch (err) {
        console.log(err);
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
    fetchMessages(params.recipientId, true);
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

    setMessage("");
    setAllMessages((prev) => [tempMessage, ...prev]);
  };

  useEffect(() => {
    if (!socketConnected || !clientRef.current) {
      return;
    }

    fetchMessages(params.recipientId, true);

    const sub = clientRef.current.subscribe(
      `/user/queue/messages-from-${user.id}`,
      (message) => {
        const newMessage: Message = JSON.parse(message.body);
        setAllMessages((prev) => [newMessage, ...prev]);
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
      <Animated.View style={keyboardPadding} />
    </SafeAreaView>
  );
}
