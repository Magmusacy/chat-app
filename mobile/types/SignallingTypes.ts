export type Offer = {
  payload: unknown;
  recipient: number;
  sender: number;
  type: "offer";
};

export type IceCandidate = {
  type: "candidate";
  recipient: number;
  sender: number;
  payload: RTCIceCandidateInit | null;
};

export type Answer = {
  type: "answer";
  recipient: number;
  sender: number;
  payload: unknown;
};

export type SignallingMessage = Offer | IceCandidate | Answer;
