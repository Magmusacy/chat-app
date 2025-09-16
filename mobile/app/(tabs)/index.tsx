import { useAuth } from "@/context/AuthContext";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, logOut } = useAuth();

  return (
    <SafeAreaView className=" flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={logOut}
        className="bg-red-200 w-48 h-24 flex items-center justify-center"
      >
        <Text className="text-black text-lg font-semibold">log out</Text>
      </TouchableOpacity>
      <Text>{user?.email}</Text>
    </SafeAreaView>
  );
}
