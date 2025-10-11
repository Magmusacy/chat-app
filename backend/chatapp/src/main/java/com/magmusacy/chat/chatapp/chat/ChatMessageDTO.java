package com.magmusacy.chat.chatapp.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatMessageDTO(
        @NotBlank
        String content,
        @NotNull
        int senderId,
        @NotNull
        int recipientId,
        @NotNull
        String chatRoomId
) {}
