package com.magmusacy.chat.chatapp.user.dto;

import java.time.LocalDateTime;

public record UserDTO(int id, String name, Boolean isOnline, LocalDateTime lastSeen, String profilePictureUrl) {
}
