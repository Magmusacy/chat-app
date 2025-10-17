import {
  IceCandidate,
  Offer,
  SignallingMessage,
} from "@/types/SignallingTypes";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWebSocket } from "./WebSocketContext";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // maybe add TURN???
  ],
};

interface RTCInterface {
  pendingCandidates: IceCandidate[];
  pendingOffer: Offer | null;
  resetPendingCandidates: () => void;
}

export const RTCContext = createContext<RTCInterface | null>(null);

// This component if only responsible for holding in memory incoming signal from signaling server
// the real connection is performed in VideoCall component, this context also hold information about
// the call state
function RTCProvider({ children }: { children: ReactNode }) {
  const { clientRef, socketConnected } = useWebSocket();
  // const pendingCandidatesRef = useRef<any[]>([]);
  // const pendingOfferRef = useRef<Offer | null>([]);
  const [pendingCandidates, setPendingCandidates] = useState<IceCandidate[]>(
    []
  );
  const [pendingOffer, setPendingOffer] = useState<Offer | null>(null);

  const resetPendingCandidates = () => {
    setPendingCandidates([]);
  };

  useEffect(() => {
    const client = clientRef.current;

    if (socketConnected && client) {
      client.subscribe("/user/queue/webrtc", async (message) => {
        try {
          const data = JSON.parse(message.body) as SignallingMessage;

          if (data.type === "offer") {
            setPendingOffer(data);
          } else if (data.type === "candidate") {
            setPendingCandidates((prev) => [...prev, data]);
          }
          // await pcRef.current?.setRemoteDescription(
          //   new RTCSessionDescription(data.payload as any)
          // );
          // pendingCandidatesRef.current.forEach((c) =>
          //   pcRef.current?.addIceCandidate(c)
          // );
          // pendingCandidatesRef.current = [];

          // const answerDescription = await pcRef.current?.createAnswer();
          // await pcRef.current?.setLocalDescription(answerDescription);

          // console.warn(answerDescription);

          // const answer: Answer = {
          //   sender: data.recipient,
          //   recipient: data.sender,
          //   payload: answerDescription,
          //   type: answerDescription.type as "answer",
          // };

          // clientRef.current?.publish({
          //   destination: "/app/signal",
          //   body: JSON.stringify(answer),
          // });
          // } else if (data.type === "answer") {
          //   await pcRef.current?.setRemoteDescription(
          //     new RTCSessionDescription(data.payload as any)
          //   );
          // } else if (data.type === "candidate") {
          //   setPendingCandidates((prev) => [...prev, data]);
          // if (pcRef.current?.remoteDescription) {
          //   await pcRef.current?.addIceCandidate(data.payload as any);
          // } else {
          //   pendingCandidatesRef.current.push(data.payload);
          // }
        } catch (err) {
          console.error("Error parsing signalling message:", err);
        }
      });
    }
  }, [socketConnected]);

  return (
    <RTCContext.Provider
      value={{ pendingCandidates, pendingOffer, resetPendingCandidates }}
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
