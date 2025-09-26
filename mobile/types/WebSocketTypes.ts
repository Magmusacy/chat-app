import { Client } from "@stomp/stompjs";
import { LatestMessage } from "./LatestMessage";
import { OtherUser } from "./OtherUser";

export interface WebSocketContextType {
  client: Client | null;
  // connectionStatus: "connected" | "disconnected" | "connecting";
  allUsers: OtherUser[];
  latestMessages: Map<LatestMessage["chatRoomId"], LatestMessage>;
}
