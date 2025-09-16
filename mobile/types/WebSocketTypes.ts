import { Client } from "@stomp/stompjs";
import { OtherUser } from "./OtherUser";

export interface WebSocketContextType {
  client: Client | null;
  // connectionStatus: "connected" | "disconnected" | "connecting";
  allUsers: OtherUser[];
}
