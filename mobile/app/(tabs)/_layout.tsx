import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ headerShown: false, title: "Chats" }}
      />

      <Tabs.Screen
        name="users"
        options={{ headerShown: false, title: "Users" }}
      />
    </Tabs>
  );
}
