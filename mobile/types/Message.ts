export interface Message {
  id: number;
  content: string;
  senderId: number;
  recipientId: number;
  chatRoomId: string;
  timestamp: string;
}
