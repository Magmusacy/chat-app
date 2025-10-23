import { useWebRTC } from "@/context/RTCContext";
import { useWebSocket } from "@/context/WebSocketContext";
import {
  Answer,
  IceCandidate,
  Offer,
  SignallingMessage,
} from "@/types/SignallingTypes";
import useAuthenticatedUser from "@/utils/useAuthenticatedUser";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

      pcRef.current.addEventListener("iceconnectionstatechange", () => {
        console.log(
          "🧊 ICE connection state:",
          pcRef.current?.iceConnectionState
        );
      });

      pcRef.current.addEventListener("icegatheringstatechange", () => {
        console.log(
          "📡 ICE gathering state:",
          pcRef.current?.iceGatheringState
        );
      });

      pcRef.current.addEventListener("signalingstatechange", () => {
        console.log("📶 Signaling state:", pcRef.current?.signalingState);
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

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 gap-3 mt-10">
        {/* Local Video */}
        <View className="flex-1">
          <Text className="text-white mb-2">Local Stream (You)</Text>
          {localSrc ? (
            <RTCView
              streamURL={localSrc}
              style={{ flex: 1 }}
              objectFit="cover"
              mirror={isFrontCamera}
            />
          ) : (
            <View className="flex-1 bg-gray-800 items-center justify-center">
              <Text className="text-gray-500">No local video</Text>
            </View>
          )}
        </View>

        {/* Remote Video */}
        <View className="flex-1">
          <Text className="text-white mb-2">Remote Stream</Text>
          {remoteSrc ? (
            <RTCView
              streamURL={remoteSrc}
              style={{ flex: 1 }}
              objectFit="cover"
            />
          ) : (
            <View className="flex-1 bg-gray-800 items-center justify-center">
              <Text className="text-gray-500">No remote video</Text>
            </View>
          )}
        </View>
      </View>

      {/* Buttons */}
      <View className="flex-row gap-3 py-5 justify-center">
        <TouchableOpacity
          onPress={toggleMute}
          className={`${isMuted ? "bg-red-600" : "bg-gray-600"} py-4 px-6 rounded-full`}
        >
          <Text className="text-white text-center font-semibold">
            {isMuted ? "🔇 Unmute" : "🎤 Mute"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={switchCamera}
          className="bg-blue-600 py-4 px-6 rounded-full"
        >
          <Text className="text-white text-center font-semibold">🔄 Flip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default VideoCall;
