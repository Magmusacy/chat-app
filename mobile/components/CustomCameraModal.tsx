import { PhotoInfo } from "@/app/user/[id]";
import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (photoInfo: PhotoInfo) => void;
}

export default function CameraModal({
  visible,
  onClose,
  onPhotoTaken,
}: CameraModalProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const newScale = savedScale.value * e.scale;
      scale.value = newScale;
      runOnJS(setZoom)(Math.max(0, Math.min(1, newScale - 1)));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 bg-background items-center justify-center px-6">
          <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
          <Text className="text-white text-xl font-bold mt-6 mb-4">
            Camera Permission Required
          </Text>
          <Text className="text-gray-400 text-center mb-8">
            We need access to your camera to take photos
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-primary rounded-xl px-8 py-4 mb-4"
          >
            <Text className="text-white font-semibold text-base">
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="py-3">
            <Text className="text-gray-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        exif: true,
      });

      if (photo?.uri && photo?.exif) {
        // Extract filename from URI
        const fileName =
          photo.uri.split("/").pop() || `photo_${Date.now()}.jpg`;

        onPhotoTaken({
          mimeType: photo.exif.MimeType || "image/jpeg",
          uri: photo.uri,
          name: fileName,
        });
        onClose();
      }
    } catch (error) {
      console.error("Error taking picture: ", error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <Modal visible={visible} animationType="slide">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          <GestureDetector gesture={pinchGesture}>
            <View style={{ flex: 1 }}>
              <CameraView
                ref={cameraRef}
                facing={facing}
                zoom={zoom}
                style={{ flex: 1 }}
              >
                <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
                </View>

                <View className="absolute bottom-0 left-0 right-0 pb-12 items-center">
                  <View className="flex-row items-center justify-center gap-8">
                    <TouchableOpacity
                      onPress={toggleCameraFacing}
                      className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
                    >
                      <Ionicons
                        name="camera-reverse-outline"
                        size={28}
                        color="white"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={takePicture}
                      className="w-20 h-20 rounded-full bg-white items-center justify-center border-4 border-white/30"
                      activeOpacity={0.8}
                    >
                      <View className="w-16 h-16 rounded-full bg-white" />
                    </TouchableOpacity>

                    {/* Placeholder for symmetry */}
                    <View className="w-14 h-14" />
                  </View>
                </View>
              </CameraView>
            </View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
