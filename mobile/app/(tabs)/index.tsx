import { useAuth } from "@/context/AuthContext";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, logOut } = useAuth();

  return (
    <SafeAreaView>
      <Button title="logout" onPress={logOut} />
      <Text>{user?.email}</Text>
    </SafeAreaView>
  );
}
