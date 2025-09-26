package com.magmusacy.chat.chatapp.chatroom;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LatestMessageResponseDTO(
        boolean readStatus,
        int senderId,
        int recipientId,
        String content,
        String chatRoomId,
        LocalDateTime timestamp
) {
}
