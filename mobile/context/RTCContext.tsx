import { OtherUser } from "@/types/OtherUser";
import {
  IceCandidate,
  Offer,
  SignallingMessage,
} from "@/types/SignallingTypes";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useWebSocket } from "./WebSocketContext";

interface RTCInterface {
  pendingCandidatesRef: RefObject<IceCandidate[]>;
  pendingOfferRef: RefObject<Offer | null>;
  handleCallDisconnect: () => void;
  caller: OtherUser | null;
}

export const RTCContext = createContext<RTCInterface | null>(null);

// This component if only responsible for holding in memory incoming signal from signaling server
// the real connection is performed in VideoCall component, this context also hold information about
// the call state
function RTCProvider({ children }: { children: ReactNode }) {
  const { clientRef, socketConnected } = useWebSocket();
  const pendingCandidatesRef = useRef<IceCandidate[]>([]);
  const pendingOfferRef = useRef<Offer | null>(null);
  const [caller, setCaller] = useState<OtherUser | null>(null);
  const { allUsers } = useWebSocket();

  const handleCallDisconnect = () => {
    setCaller(null);
  };

  useEffect(() => {
    const client = clientRef.current;
    if (socketConnected && client) {
      client.subscribe("/user/queue/webrtc", async (message) => {
        try {
          const data = JSON.parse(message.body) as SignallingMessage;

          if (data.type === "offer") {
            pendingOfferRef.current = data as Offer;
            const caller = allUsers.get(parseInt(data.sender));
            if (caller) {
              setCaller(caller);
            }
          } else if (data.type === "candidate") {
            pendingCandidatesRef.current.push(data as IceCandidate);
          }
        } catch (err) {
          console.error("Error parsing signalling message:", err);
        }
      });
    }
  }, [socketConnected, clientRef, allUsers]);

  return (
    <RTCContext.Provider
      value={{
        pendingCandidatesRef,
        pendingOfferRef,
        handleCallDisconnect,
        caller,
      }}
    >
      {children}
    </RTCContext.Provider>
  );
}

export function useWebRTC() {
  const context = useContext(RTCContext);

  if (!context) {
    throw new Error("useWebRTC must be used within RTCProvider");
  }

  return context;
}

export default RTCProvider;
