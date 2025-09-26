import { Client } from "@stomp/stompjs";
import { LatestMessage } from "./LatestMessage";
import { OtherUser } from "./OtherUser";

export type WebSocketContextType = {
  client: Client | null;
  allUsers: OtherUser[];
  latestMessages: Map<LatestMessage["chatRoomId"], LatestMessage>;
};
