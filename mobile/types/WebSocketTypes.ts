import { Client } from "@stomp/stompjs";
import { RefObject } from "react";
import { LatestMessage } from "./LatestMessage";
import { OtherUser } from "./OtherUser";

export type WebSocketContextType = {
  clientRef: RefObject<Client | null>;
  allUsers: OtherUser[];
  latestMessages: Map<LatestMessage["chatRoomId"], LatestMessage>;
  send: (
    destination: string,
    body: string,
    headers?: Record<string, string>
  ) => void;
  socketConnected: boolean;
};
