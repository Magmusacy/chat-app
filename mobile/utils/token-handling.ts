import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refreshToken";

export function useRefreshToken() {
  const setRefreshToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (err) {
      console.error("Failed to save refresh token: ", err);
    }
  };

  const getRefreshToken = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      return refreshToken;
    } catch (err) {
      console.error("Failed to get refresh token: ", err);
    }
  };

  const deleteRefreshToken = async () => {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.error("failed to remove refresh token:", err);
    }
  };

  return { getRefreshToken, setRefreshToken, deleteRefreshToken };
}
