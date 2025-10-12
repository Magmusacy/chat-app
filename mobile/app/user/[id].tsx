import Notification from "@/components/Notification";
import ProfileInformation from "@/components/ProfileInformation";
import { defaultImage } from "@/config";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@kolking/react-native-avatar";
import { CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function User() {
  const user = useAuthenticatedUser();
  const { setUser, logOut } = useAuth();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.name || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImagePickerMenu, setShowImagePickerMenu] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
    visible: boolean;
  }>({ type: "success", message: "", visible: false });
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermisson] = useCameraPermissions();

  const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    console.log(result);

    if (!result.canceled) {
      console.log("chuj");
    }
  };

  const pickImage = async () => {
    setShowImagePickerMenu(false);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      await saveImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    setShowImagePickerMenu(false);
    console.log("hej");
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("You need to enable camera permissions!");
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      await saveImage(result.assets[0]);
    }
  };

  const saveImage = async (imageAsset: ImagePicker.ImagePickerAsset) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", {
      uri: imageAsset.uri,
      type: imageAsset.mimeType || "image/jpeg",
      name: imageAsset.fileName || "profile.jpg",
    } as any);
    try {
      const res = await api.post("/api/blobs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const profilePictureUrl = res.data.profilePictureUrl;
      setUser({ ...user, profilePictureUrl });
    } catch (error) {
      console.error("There was an error while trying to save profile image");
    } finally {
      setIsUploading(false);
      setImage(null);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/users");
      setShowDeleteModal(false);
      logOut();
    } catch (error) {
      console.error("Failed to delete account");
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      <Notification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
        onDismiss={() => setNotification({ ...notification, visible: false })}
      />

      <KeyboardAwareScrollView
        className="flex-1"
        extraScrollHeight={50}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="items-center mt-8">
          <View className="relative">
            <View className="relative">
              <Avatar
                source={
                  user.profilePictureUrl
                    ? { uri: user.profilePictureUrl }
                    : undefined
                }
                defaultSource={defaultImage}
                size={128}
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowImagePickerMenu(!showImagePickerMenu)}
              disabled={isUploading}
              className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-2 border-background"
            >
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            {user.name}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">{user.email}</Text>

          <TouchableOpacity
            onPress={logOut}
            className="mt-3 bg-red-500/10 border border-red-500/30 rounded-full px-6 py-2 flex-row items-center"
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text className="text-red-500 ml-2 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-8 flex-1">
          <ProfileInformation
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            fullName={fullName}
            setFullName={setFullName}
            onShowNotification={(type, message) =>
              setNotification({ type, message, visible: true })
            }
          />

          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            className="bg-red-500/10 rounded-2xl p-5 flex-row items-center justify-center border border-red-500/30 mt-6"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 ml-2 font-semibold">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {showImagePickerMenu && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowImagePickerMenu(false)}
            className="absolute inset-0 bg-black/40"
            style={{ zIndex: 50 }}
          />
          <View
            className="absolute bg-surfaceLight rounded-2xl shadow-lg border border-gray-700 overflow-hidden"
            style={{
              top: 150,
              right: 30,
              width: 220,
              zIndex: 51,
            }}
          >
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-row items-center p-4 border-b border-gray-700"
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text className="text-white ml-3 font-medium">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              className="flex-row items-center p-4"
            >
              <Ionicons name="images" size={20} color="white" />
              <Text className="text-white ml-3 font-medium">
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={showDeleteModal}
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowDeleteModal(false)}
          className="flex-1 justify-end bg-black/30"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="bg-surfaceLight rounded-t-3xl p-8">
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-6">
                  <Ionicons name="trash-outline" size={40} color="#EF4444" />
                </View>
                <Text className="text-white text-2xl font-bold mb-3">
                  Delete Account?
                </Text>
                <Text className="text-gray-400 text-center text-base leading-6">
                  This will permanently delete your account and all associated
                  data. This action cannot be undone.
                </Text>
              </View>

              <View className="space-y-3 mb-4">
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  className="bg-red-500 rounded-2xl p-5 items-center mb-2"
                >
                  <Text className="text-white font-bold text-base">
                    Yes, Delete My Account
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowDeleteModal(false)}
                  className="bg-surfaceLight border-2 border-gray-600 rounded-2xl p-5 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Keep Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
