import { API_URL } from "@/config";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    name: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<string | null>;
  logOut: () => Promise<void>;
  isLoadingUser: boolean;
  errorMessage: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const validateUser = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        setUser(null);
      } else {
        const userInfo: User = await getUserInfo(token);
        setUser(userInfo);
      }

      setIsLoadingUser(false);
    };

    validateUser();
  }, []);

  const getUserInfo = async (token: string): Promise<User> => {
    try {
      const userInfoResponse = await fetch(`${API_URL}/user/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return await userInfoResponse.json();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Network error";
      setErrorMessage(errorMsg);
      throw error;
    }
  };

  const register = async (
    email: string,
    name: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
          passwordConfirmation,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json().catch(() => ({}));
        const errorMsg = errorData.message || "Registration failed";
        setErrorMessage(errorMsg);
        return errorMsg;
      }

      const registerJson: { token: string } = await registerResponse.json();
      // login(email, password);
      setUser(await getUserInfo(registerJson.token));
      await SecureStore.setItemAsync("token", registerJson.token);
      return null;
    } catch (error) {
      console.log("Network error:", error);
      const errorMsg = error instanceof Error ? error.message : "Network error";
      setErrorMessage(errorMsg);
      return errorMsg;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        const errorMsg = errorData.message || "Login failed";
        setErrorMessage(errorMsg);
        return errorMsg;
      }

      const loginJson: { token: string } = await loginResponse.json();
      setUser(await getUserInfo(loginJson.token));
      await SecureStore.setItemAsync("token", loginJson.token);
      return null;
    } catch (error) {
      console.log("Network error:", error);
      const errorMsg = error instanceof Error ? error.message : "Network error";
      setErrorMessage(errorMsg);
      return errorMsg;
    }
  };

  const logOut = async () => {
    console.log("test");
    await SecureStore.deleteItemAsync("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logOut, isLoadingUser, errorMessage }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
