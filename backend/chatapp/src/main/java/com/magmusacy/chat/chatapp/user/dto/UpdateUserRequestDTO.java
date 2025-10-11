package com.magmusacy.chat.chatapp.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(
        String name,
        String password,
        String passwordConfirmation
) {
}
