import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#23293a",
            height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
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
            tabBarBadge: 2,
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
