import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NotificationProps {
  type: "success" | "error" | "info";
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
}

// Todo fix this animation
export default function Notification({
  type,
  message,
  visible,
  onDismiss,
  duration = 4000,
}: NotificationProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useMemo(() => new Animated.Value(-100), []);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onDismiss?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
    }
  }, [visible, duration, slideAnim, onDismiss]);

  if (!visible) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-500",
          icon: "checkmark-circle" as const,
          iconColor: "#FFF",
        };
      case "error":
        return {
          bg: "bg-red-500",
          icon: "close-circle" as const,
          iconColor: "#FFF",
        };
      case "info":
        return {
          bg: "bg-blue-500",
          icon: "information-circle" as const,
          iconColor: "#FFF",
        };
    }
  };

  const styles = getNotificationStyles();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: insets.top + 10,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onDismiss}
        className={`${styles.bg} rounded-2xl px-5 py-4 flex-row items-center shadow-2xl`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <Ionicons name={styles.icon} size={28} color={styles.iconColor} />
        <Text className="text-white font-semibold text-base ml-3 flex-1">
          {message}
        </Text>
        <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
}
