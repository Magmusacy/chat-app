import { AuthProvider, useAuth } from "@/context/AuthContext";
import WebSocketProvider from "@/context/WebSocketContext";
import { Stack } from "expo-router";
import "../global.css";

function AppContent() {
  const { user } = useAuth();
  console.log("tried to log in");

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#23293a" },
      }}
    >
      <Stack.Protected guard={user != null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={user == null}>
        <Stack.Screen
          name="(auth)/AuthScreen"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </AuthProvider>
  );
}
