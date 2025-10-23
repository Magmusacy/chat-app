import { defaultImage } from "@/config";
import { useWebRTC } from "@/context/RTCContext";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@kolking/react-native-avatar";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function IncomingCall() {
  const offsetY = useSharedValue(-200);
  const { caller, handleCallDisconnect } = useWebRTC();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  useEffect(() => {
    offsetY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const handleAnswer = () => {
    if (caller) {
      router.push(`/videoCall/${caller.id}?type=answer` as any);
      handleCallDisconnect(); // change caller to null again
    }
  };

  const handleDecline = () => {
    handleCallDisconnect();
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: insets.top + 10,
          left: 16,
          right: 16,
          backgroundColor: "#1a1f2e",
          zIndex: 9999,
          elevation: 100,
          borderRadius: 16,
          padding: 12,
          borderWidth: 1,
          borderColor: "rgba(59, 130, 246, 0.5)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
        },
        animatedStyles,
      ]}
    >
      <View className="flex-row items-center gap-3">
        <Avatar
          source={
            caller?.profilePictureUrl
              ? { uri: caller.profilePictureUrl }
              : undefined
          }
          defaultSource={defaultImage}
          size={48}
        />

        <View className="flex-1">
          <Text className="text-white font-bold text-base">{caller?.name}</Text>
          <Text className="text-textMuted text-sm">Voice Call</Text>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleDecline}
            className="bg-red-500 w-12 h-12 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAnswer}
            className="bg-green-500 w-12 h-12 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default IncomingCall;
