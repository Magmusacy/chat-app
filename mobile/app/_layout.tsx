import { AuthProvider } from "@/context/AuthContext";
import WebSocketProvider from "@/context/WebSocketContext";
import { Stack } from "expo-router";
import "../global.css";
import RouteGuard from "./RouteGuard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <RouteGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="AuthScreen" options={{ headerShown: false }} />
          </Stack>
        </RouteGuard>
      </WebSocketProvider>
    </AuthProvider>
  );
}
