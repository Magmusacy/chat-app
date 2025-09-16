import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function TabsLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#23293a",
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, title: "Chats" }}
        />

        <Tabs.Screen
          name="users"
          options={{ headerShown: false, title: "Users" }}
        />
      </Tabs>
    </>
  );
}
