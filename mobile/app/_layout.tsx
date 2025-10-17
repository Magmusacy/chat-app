import { AuthProvider, useAuth } from "@/context/AuthContext";
import WebSocketProvider from "@/context/WebSocketContext";
import { theme } from "@/theme";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import RTCProvider from "@/context/RTCContext";
import "../global.css";

function AppContent() {
  const { user } = useAuth();
  const themeColor = "#23293a";
  SystemUI.setBackgroundColorAsync(themeColor);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: themeColor },
      }}
    >
      <Stack.Protected guard={user !== null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat/[senderId]/[recipientId]"
          options={{
            headerTintColor: "white",
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: true,
          }}
        />
        <Stack.Screen
          name="user/[id]"
          options={{
            headerTitle: "Account",
            headerTintColor: "white",
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: true,
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={user === null}>
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
    <KeyboardProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <WebSocketProvider>
            <RTCProvider>
              <AppContent />
            </RTCProvider>
          </WebSocketProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
