export interface LatestMessage {
  senderId: number;
  recipientId: number;
  readStatus: boolean;
  content: string;
  chatRoomId: string;
  timestamp: string;
}
