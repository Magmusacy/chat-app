package com.magmusacy.chat.chatapp.chat;

import java.time.LocalDateTime;

public record ChatMessageResponseDTO(
        int id,
        String content,
        int senderId,
        int recipientId,
        String chatRoomId,
        LocalDateTime timestamp
) {
}
