import { API_URL } from "@/config";
import { OtherUser } from "@/types/OtherUser";
import { WebSocketContextType } from "@/types/WebSocketTypes";
import { Client } from "@stomp/stompjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client, setClient] = useState<Client | null>(null);
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState<OtherUser[]>([]);

  useEffect(() => {
    if (!user) {
      setAllUsers([]);
      return;
    }

    const webSocketClient = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      debug: (str) => console.log("debugLog", str),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
      onConnect: () => {
        webSocketClient.subscribe("/topic/users", (message) => {
          const parsedUsers: OtherUser[] = JSON.parse(message.body);
          setAllUsers(parsedUsers);
        });

        webSocketClient.subscribe("/user/queue/users", (message) => {
          const parsedUsers: OtherUser[] = JSON.parse(message.body);
          setAllUsers(parsedUsers);
        });
      },
      onDisconnect: () => console.log("Disconnected from Websocket"),
    });

    webSocketClient.activate();
    setClient(webSocketClient);

    return () => {
      webSocketClient.deactivate();
      setClient(null);
      setAllUsers([]);
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ allUsers, client }}>
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
