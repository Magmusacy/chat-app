import { AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import "../global.css";
import RouteGuard from "./RouteGuard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="AuthScreen" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}
