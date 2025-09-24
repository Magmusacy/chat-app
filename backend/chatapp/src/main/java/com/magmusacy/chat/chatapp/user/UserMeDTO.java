package com.magmusacy.chat.chatapp.user;

import java.time.LocalDateTime;

public record UserMeDTO(
        int id,
        String name,
        String email
) {
}
