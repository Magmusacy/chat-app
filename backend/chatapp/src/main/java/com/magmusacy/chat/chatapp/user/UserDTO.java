package com.magmusacy.chat.chatapp.user;

import java.time.LocalDateTime;

public record UserDTO(int id, String name, Boolean isOnline, LocalDateTime lastSeen) {
}
