import { useWebRTC } from "@/context/RTCContext";
import { useWebSocket } from "@/context/WebSocketContext";
import {
  Answer,
  IceCandidate,
  Offer,
  SignallingMessage,
} from "@/types/SignallingTypes";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCView,
} from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // maybe add TURN???
  ],
};

function VideoCall() {
  const { recipientId: recipientIdParam, type: typeParam } =
    useLocalSearchParams();
  const recipientId = Number(recipientIdParam);
  const type = typeParam as string;

  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [remoteSrc, setRemoteSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const localStreamRef = useRef<MediaStream>(new MediaStream());
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const { clientRef, socketConnected } = useWebSocket();
  const user = useAuthenticatedUser();
  const { pendingCandidatesRef, pendingOfferRef } = useWebRTC();
  const router = useRouter();

  const setupLocalStream = useCallback(async () => {
    if (!(clientRef.current && socketConnected)) return;
    try {
      pcRef.current = new RTCPeerConnection(ICE_SERVERS);
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStreamRef.current = stream;
      setLocalSrc(stream.toURL());
      remoteStreamRef.current = new MediaStream();

      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, localStreamRef.current);
      });

      // logs for development
      pcRef.current.addEventListener("connectionstatechange", () => {
        console.log("🔌 Connection state:", pcRef.current?.connectionState);
        if (!pcRef.current) {
          console.warn("rozłączono");
          return;
        }
        switch (pcRef.current.connectionState) {
          case "disconnected":
          case "closed":
            console.log("Disconnected");
            router.back();
            break;
        }
      });

      pcRef.current.addEventListener("track", (event) => {
        const remoteStream = event.streams[0];
        remoteStreamRef.current = remoteStream;
        setRemoteSrc(remoteStream.toURL());
      });
    } catch (err) {
      console.error("Error getting local media:", err);
    }
  }, [clientRef, socketConnected]);

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());

      pcRef.current?.getSenders().forEach((sender) => {
        sender.track?.stop();
      });
      pcRef.current?.close();
      pcRef.current = null;

      setLocalSrc(null);
      setRemoteSrc(null);
    };
  }, []);

  useEffect(() => {
    const call = async () => {
      if (!(clientRef.current && socketConnected)) return;
      try {
        await setupLocalStream();

        if (!pcRef.current) {
          console.error("PCRef not initialized after setupLocalStream");
          return;
        }

        pcRef.current.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            console.log(
              "🧊 ICE candidate generated:",
              event.candidate.candidate
            );
            const candidateBody: IceCandidate = {
              sender: user.id.toString(),
              recipient: recipientId.toString(),
              type: "candidate",
              payload: event.candidate,
            };

            clientRef.current?.publish({
              destination: "/app/signal",
              body: JSON.stringify(candidateBody),
            });
          }
        });

        clientRef.current.subscribe("/user/queue/webrtc", async (message) => {
          const data = JSON.parse(message.body) as SignallingMessage;
          console.log("📨 Received signaling message:", data.type);

          if (data.type === "answer") {
            await pcRef.current?.setRemoteDescription(
              new RTCSessionDescription(data.payload as any)
            );
          } else if (data.type === "candidate") {
            const candidate = new RTCIceCandidate(data.payload as any);
            await pcRef.current?.addIceCandidate(candidate);
          }
        });

        const offerDescription = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offerDescription);

        const offer: Offer = {
          sender: user.id.toString(),
          recipient: recipientId.toString(),
          payload: offerDescription,
          type: offerDescription.type as "offer",
        };

        clientRef.current.publish({
          destination: "/app/signal",
          body: JSON.stringify(offer),
        });
      } catch (err) {
        console.error("Error starting call:", err);
      }
    };

    if (type === "call") {
      call();
    }
  }, [
    socketConnected,
    clientRef,
    user.id,
    recipientId,
    type,
    setupLocalStream,
  ]);

  useEffect(() => {
    const answer = async () => {
      if (!pendingOfferRef.current) return;

      try {
        await setupLocalStream();

        if (!pcRef.current) {
          console.error("PCRef not initialized after setupLocalStream");
          return;
        }

        pcRef.current.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            const candidateBody: IceCandidate = {
              sender: pendingOfferRef.current!.recipient,
              recipient: pendingOfferRef.current!.sender,
              type: "candidate",
              payload: event.candidate,
            };

            clientRef.current?.publish({
              destination: "/app/signal",
              body: JSON.stringify(candidateBody),
            });
          }
        });

        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(pendingOfferRef.current.payload as any)
        );

        pendingCandidatesRef.current.forEach((c) => {
          pcRef.current?.addIceCandidate(c);
        });
        pendingCandidatesRef.current = [];

        const answerDescription = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answerDescription);

        const answer: Answer = {
          sender: pendingOfferRef.current.recipient,
          recipient: pendingOfferRef.current.sender,
          payload: answerDescription,
          type: answerDescription.type as "answer",
        };

        clientRef.current?.publish({
          destination: "/app/signal",
          body: JSON.stringify(answer),
        });
        console.log("ANSWER sent");
      } catch (err) {
        console.error("Error in answer flow:", err);
      }
    };

    if (type === "answer") {
      answer();
    }
  }, [
    type,
    clientRef,
    setupLocalStream,
    pendingCandidatesRef,
    pendingOfferRef,
  ]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    const constraints = { facingMode: isFrontCamera ? "environment" : "user" };

    videoTrack.applyConstraints(constraints);
    setIsFrontCamera(!isFrontCamera);
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <RTCView
        streamURL={remoteSrc ? remoteSrc : undefined}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
        objectFit="cover"
      />

      {!remoteSrc && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1a1a1a",
          }}
        >
          <Text className="text-gray-400 text-lg">Connecting...</Text>
        </View>
      )}

      <View
        style={{
          position: "absolute",
          top: 60,
          right: 16,
          width: 120,
          height: 160,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 2,
          borderColor: "white",
          backgroundColor: "#000",
        }}
      >
        <RTCView
          streamURL={localSrc || ""}
          style={{ width: "100%", height: "100%" }}
          objectFit="cover"
          mirror={isFrontCamera}
        />
        {!localSrc && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#333",
            }}
          >
            <Text className="text-gray-500 text-xs">No video</Text>
          </View>
        )}
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 50,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          gap: 20,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          onPress={switchCamera}
          className="bg-gray-700/80 w-16 h-16 rounded-full items-center justify-center"
          activeOpacity={0.8}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEndCall}
          className="bg-red-500 w-16 h-16 rounded-full items-center justify-center"
          activeOpacity={0.8}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Ionicons name="call" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleMute}
          className={`${isMuted ? "bg-red-500" : "bg-gray-700/80"} w-16 h-16 rounded-full items-center justify-center`}
          activeOpacity={0.8}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
        >
          <Ionicons
            name={isMuted ? "mic-off" : "mic"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default VideoCall;
