function resolvePath(senderId: number, recipientId: number) {
  return {
    senderId: String(Math.min(senderId, recipientId)),
    recipientId: String(Math.max(senderId, recipientId)),
  };
}

export function chatRoomIdResolver(
  senderIdNum: number,
  recipientIdNum: number
) {
  const { senderId, recipientId } = resolvePath(senderIdNum, recipientIdNum);
  return `${senderId}_${recipientId}`;
}
