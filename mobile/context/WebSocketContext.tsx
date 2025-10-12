import { API_URL } from "@/config";
import { LatestMessage } from "@/types/LatestMessage";
import { OtherUser } from "@/types/OtherUser";
import { WebSocketContextType } from "@/types/WebSocketTypes";
import api from "@/utils/api";
import { Client } from "@stomp/stompjs";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

type PendingMessage = {
  destination: string;
  body: string;
  headers?: Record<string, string>;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const clientRef = useRef<Client | null>(null);
  const { user, tokenRef, handleRefreshToken, accessToken } = useAuth();
  const [allUsers, setAllUsers] = useState<Map<number, OtherUser>>(new Map());
  const [latestMessages, setLatestMessages] = useState<
    Map<LatestMessage["chatRoomId"], LatestMessage>
  >(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active"
  );
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  // Queue for outbound messages to retry after reconnect

  const send = useCallback(
    (destination: string, body: string, headers?: Record<string, string>) => {
      const msg: PendingMessage = { destination, body, headers };
      if (clientRef.current && clientRef.current.connected) {
        try {
          clientRef.current.publish({ destination, body, headers });
        } catch {}
      } else {
      }
    },
    []
  );

  // refresh the access token during ongoing WS connection when access token changes
  useEffect(() => {
    if (clientRef.current && accessToken && clientRef.current.connected) {
      clientRef.current.publish({
        destination: `/app/refresh.connection.token`,
        body: JSON.stringify({
          token: accessToken,
        }),
      });
    }
  }, [accessToken]);

  // app in background handling
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        appStateRef.current = nextAppState;
        const becameActive = nextAppState === "active";
        setIsAppActive(becameActive);

        if (!becameActive && clientRef.current) {
          clientRef.current.deactivate();
          setIsConnected(false);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // app doesn't have internet connection handling
  //  SOMETHING IS WRONG HERE
  // fix this in the future
  // useEffect(() => {
  //   let isMounted = true;

  //   const checkInitialState = async () => {
  //     const state = await Network.getNetworkStateAsync();
  //     if (!isMounted) return;
  //     const online = state.isConnected && state.isInternetReachable;
  //     console.warn("Initial network state:", online);
  //     if (!online && clientRef.current) {
  //       clientRef.current.deactivate();
  //       setIsConnected(false);
  //     }
  //   };

  //   checkInitialState();

  //   const subscription = Network.addNetworkStateListener((state) => {
  //     const online = state.isConnected && state.isInternetReachable;
  //     console.warn("Network state changed:", online);
  //     if (!online && clientRef.current) {
  //       clientRef.current.deactivate();
  //       setIsConnected(false);
  //     }
  //   });

  //   return () => {
  //     isMounted = false;
  //     subscription.remove();
  //   };
  // }, []);

  // sprawdz jak to wyglada dla wiadomosci czy my robimy requesta czy bierzemy je w websocketow wszystkie i zrob tak samo tutaj

  const updateUsersMapWithNewUsersArray = (users: OtherUser[]) => {
    users.forEach((user) =>
      setAllUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(user.id, user);
        return newMap;
      })
    );
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get("/users");
      const data = response.data as OtherUser[];
      updateUsersMapWithNewUsersArray(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      setAllUsers(new Map());
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      return;
    }

    if (!isAppActive) {
      return;
    }

    fetchAllUsers();

    const webSocketClient = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      debug: (str) => console.log("debugLog", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 10000,
      beforeConnect: async () => {
        try {
          await handleRefreshToken();
          webSocketClient.connectHeaders = {
            Authorization: `Bearer ${tokenRef.current}`,
          };
        } catch {
          console.log("WS beforeConnect refresh failed");
        }
      },
      onConnect: () => {
        setIsConnected(true);
        webSocketClient.subscribe("/topic/users", (message) => {
          const parsedUsers = JSON.parse(message.body) as OtherUser;
          updateUsersMapWithNewUsersArray([parsedUsers]);
        });

        webSocketClient.subscribe(
          "/user/queue/chat.latest-message-updated",
          (message) => {
            const latestMessage = JSON.parse(message.body) as LatestMessage;
            setLatestMessages((prev) => {
              const newMap = new Map(prev);
              newMap.set(latestMessage.chatRoomId, latestMessage);
              return newMap;
            });
          }
        );

        webSocketClient.subscribe("/topic/deleted.user", (message) => {
          const deletedUserId = parseInt(message.body as string);
          setAllUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(deletedUserId);
            return newMap;
          });
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.warn("Disconnected from WS session!");
      },
      onStompError: async (frame) => {
        console.error("Expired");
        const headerMsg = frame.headers["message"];

        if (headerMsg !== "JWT_EXPIRED") {
          console.error("Stomp error, reason:", headerMsg);
          return;
        }

        setIsConnected(false);
      },
      onWebSocketClose: (e) => {
        console.warn("zazaza");
      },
    });

    clientRef.current = webSocketClient;
    webSocketClient.activate();

    return () => {
      setIsConnected(false);
      if (clientRef.current === webSocketClient) {
        clientRef.current = null;
      }
      setAllUsers(new Map());
      webSocketClient.deactivate();
    };
  }, [user, isAppActive, handleRefreshToken, tokenRef]);

  useEffect(() => {
    const getLatestMessages = async () => {
      const response = await fetch(`${API_URL}/latest-messages`, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: LatestMessage[] = await response.json();
      setLatestMessages((prev) => {
        const newMap = new Map(prev);
        data.forEach((msg) => {
          newMap.set(msg.chatRoomId, msg);
        });
        return newMap;
      });
    };
    getLatestMessages();
  }, [user, tokenRef]);

  return (
    <WebSocketContext.Provider
      value={{
        latestMessages,
        allUsers,
        clientRef,
        send,
        socketConnected: isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }

  return context;
}
