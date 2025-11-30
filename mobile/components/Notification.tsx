import { NotificationInterface } from "@/app/user/[id]";
import { Ionicons } from "@expo/vector-icons";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface NotificationProps {
  notification: NotificationInterface;
  setNotification: Dispatch<SetStateAction<NotificationInterface>>;
  duration: number;
}

export default function Notification({
  notification,
  setNotification,
  duration,
}: NotificationProps) {
  const offsetY = useSharedValue(-200);
  const visible = notification.visible;
  const timerRef = useRef<number | null>(null);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  const showNotification = useCallback(() => {
    offsetY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    setNotification((prev) => ({ ...prev, visible: true }));
  }, [offsetY, setNotification]);

  const hideNotification = useCallback(() => {
    offsetY.value = withSpring(-200, {
      damping: 15,
      stiffness: 100,
    });
    setNotification((prev) => ({ ...prev, visible: false }));
  }, [offsetY, setNotification]);

  useEffect(() => {
    if (visible) {
      showNotification();
      timerRef.current = setTimeout(hideNotification, duration);
    } else {
      hideNotification();
    }
  }, [visible, showNotification, hideNotification, duration]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 10,
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
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            hideNotification();
          }
        }}
        className={`rounded-2xl px-5 py-4 flex-row items-center`}
      >
        <Text className="text-white font-semibold text-base ml-3 flex-1">
          {notification.message}
        </Text>
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
}
