import { useWebSocket } from "@/context/WebSocketContext";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { latestMessages } = useWebSocket();
  const user = useAuthenticatedUser();

  const unreadMessagesCount = [...latestMessages.values()].filter(
    (msg) => !msg.readStatus && msg.senderId !== user.id
  ).length;

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#2c3445",
            height: 70 + (insets.bottom > 0 ? insets.bottom : 0),
            elevation: 4,
            borderTopWidth: 0,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarItemStyle: {
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: "#23293a",
          },
          headerTintColor: "#fff",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Chats",
            tabBarBadge:
              unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
            tabBarBadgeStyle: {},

            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="users"
          options={{
            title: "Users",
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
