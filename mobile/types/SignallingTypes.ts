export type Offer = {
  payload: unknown;
  recipient: string;
  sender: string;
  type: "offer";
};

export type IceCandidate = {
  type: "candidate";
  recipient: string;
  sender: string;
  payload: RTCIceCandidateInit | null;
};

export type Answer = {
  type: "answer";
  recipient: string;
  sender: string;
  payload: unknown;
};

export type SignallingMessage = Offer | IceCandidate | Answer;
