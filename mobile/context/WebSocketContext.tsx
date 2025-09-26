import { API_URL } from "@/config";
import { LatestMessage } from "@/types/LatestMessage";
import { OtherUser } from "@/types/OtherUser";
import { WebSocketContextType } from "@/types/WebSocketTypes";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { Client } from "@stomp/stompjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import SockJS from "sockjs-client";

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client, setClient] = useState<Client | null>(null);
  const user = useAuthenticatedUser();
  const [allUsers, setAllUsers] = useState<OtherUser[]>([]);
  const [latestMessages, setLatestMessages] = useState<
    Map<LatestMessage["chatRoomId"], LatestMessage>
  >(new Map());

  useEffect(() => {

    const webSocketClient = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      debug: (str) => console.log("debugLog", str),
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
      onConnect: () => {
        webSocketClient.subscribe("/topic/users", (message) => {
          const parsedUsers = JSON.parse(message.body) as OtherUser[];
          setAllUsers(parsedUsers);
        });

        webSocketClient.subscribe("/user/queue/users", (message) => {
          const parsedUsers = JSON.parse(message.body) as OtherUser[];
          setAllUsers(parsedUsers);
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

  useEffect(() => {
    const getLatestMessages = async () => {
      const response = await fetch(`${API_URL}/latest-messages`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
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
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ latestMessages, allUsers, client }}>
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
