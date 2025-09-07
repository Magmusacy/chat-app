package com.magmusacy.chat.chatapp.chat;

public record ChatMessageDTO(
        String content,
        int senderId,
        int recipientId,
        int chatRoomId
) {}
