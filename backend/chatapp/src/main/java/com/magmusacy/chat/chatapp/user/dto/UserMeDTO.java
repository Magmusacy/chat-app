package com.magmusacy.chat.chatapp.user.dto;

public record UserMeDTO(
        int id,
        String name,
        String email,
        String profilePictureUrl
) {
}
