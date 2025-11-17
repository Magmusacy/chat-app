import { API_URL } from "@/config";
import { AuthContextType, User } from "@/types/AuthContextTypes";
import api from "@/utils/api";
import { useRefreshToken } from "@/utils/token-handling";
import axios, { InternalAxiosRequestConfig } from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
export const AuthContext = createContext<AuthContextType | null>(null);

// token expiry time in seconds
function getTokenExpiryTime(token: string | null): number {
  try {
    if (!token) return 0;
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp || !payload.iat)
      throw new Error("No expiration or issued date");
    const now = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - now;
    return remainingTime;
  } catch (e) {
    console.log(token);
    console.error(e);
    return 0;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { getRefreshToken, setRefreshToken, deleteRefreshToken } =
    useRefreshToken();
  const tokenRef = useRef<string>("");
  const refreshTimeOffset = 30;

  const handleRefreshToken = useCallback(async () => {
    if (getTokenExpiryTime(accessToken) > refreshTimeOffset) return;

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: await getRefreshToken(),
    });

    if (response.status === 200) {
      const { accessToken: newToken } = response.data;
      tokenRef.current = newToken;
      setAccessToken(newToken);
    } else {
      logOut();
    }
  }, []);

  useEffect(() => {
    const remainingTime = getTokenExpiryTime(accessToken);
    const refreshTime = Math.max(remainingTime - refreshTimeOffset, 0) * 1000;

    const timer = setTimeout(() => {
      handleRefreshToken();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [accessToken, handleRefreshToken]);

  // set up axios interceptors for handling access / refresh tokens (set up once)
  useEffect(() => {
    const req = api.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const isAuthRoute = config.url?.startsWith("/auth");

        if (!isAuthRoute) {
          try {
            const token = tokenRef.current;
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error("Error adding auth token to request:", error);
            // We don't throw here to allow the request to proceed even if token retrieval fails
          }
        }

        return config;
      },
      (error) => {
        console.error(error);
        return Promise.reject(error);
      }
    );

    const res = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.log("error:", error);
        const originalRequest = error.config;

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            handleRefreshToken();
            originalRequest.headers["Authorization"] =
              `Bearer ${tokenRef.current}`;

            return api(originalRequest);
          } catch (refreshError) {
            console.log(refreshError);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(res);
    };
  }, [handleRefreshToken]);

  useEffect(() => {
    const validateUser = async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        setUser(null);
        return;
      }
      try {
        const response = await api.post("/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken;
        if (!newAccessToken) {
          setUser(null);
          return;
        }
        tokenRef.current = newAccessToken;
        const userInfo = await getUserInfo(newAccessToken);
        setUser(userInfo);
      } catch {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    validateUser();
  }, []);

  const getUserInfo = async (token: string): Promise<User> => {
    try {
      // We pass the header explicitly because we can't guarantee that interceptors are set up yet
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { ...response.data, token };
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.message;
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage("No response from server");
      } else {
        setErrorMessage(error.message);
      }
      return Promise.reject();
    }
  };

  const register = async (
    email: string,
    name: string,
    password: string,
    passwordConfirmation: string
  ): Promise<void> => {
    try {
      const registerResponse = await api.post("/auth/register", {
        email,
        name,
        password,
        passwordConfirmation,
      });

      const registerJson: { accessToken: string; refreshToken: string } =
        registerResponse.data;
      tokenRef.current = registerJson.accessToken;
      setUser(await getUserInfo(registerJson.accessToken));

      // store only refresh token
      setRefreshToken(registerJson.refreshToken);
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.message || "Registration failed";
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage("No response from server");
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const loginResponse = await api.post("/auth/login", {
        email,
        password,
      });

      const loginData: { accessToken: string; refreshToken: string } =
        loginResponse.data;
      tokenRef.current = loginData.accessToken;
      setUser(await getUserInfo(loginData.accessToken));

      setRefreshToken(loginData.refreshToken);
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.message || "Login failed";
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage("No response from server");
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  const logOut = async () => {
    deleteRefreshToken();
    tokenRef.current = "";
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logOut,
        isLoadingUser,
        errorMessage,
        tokenRef,
        handleRefreshToken,
        accessToken,
      }}
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
