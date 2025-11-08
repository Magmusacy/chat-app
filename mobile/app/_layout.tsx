import IncomingCall from "@/components/IncomingCall";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import RTCProvider, { useWebRTC } from "@/context/RTCContext";
import WebSocketProvider from "@/context/WebSocketContext";
import { theme } from "@/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

function AppContent() {
  const { user } = useAuth();
  const { caller } = useWebRTC();
  const themeColor = "#23293a";
  SystemUI.setBackgroundColorAsync(themeColor);

  return (
    <>
      <StatusBar style="light" />
      {caller && <IncomingCall />}
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
          <Stack.Screen
            name="videoCall/[recipientId]"
            options={{
              headerTitle: "",
              headerTintColor: "white",
              headerStyle: { backgroundColor: "transparent" },
              headerTransparent: true,
              headerShadowVisible: false,
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
    </>
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
