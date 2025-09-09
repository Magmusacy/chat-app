package com.magmusacy.chat.chatapp.user;

import java.time.LocalDateTime;

public record UserDTO(
        String name,
        Boolean isOnline,
        LocalDateTime lastSeen
) {
}
