package com.magmusacy.chat.chatapp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @Email(message = "Please provide a valid email address")
        @NotBlank(message = "Email cannot be empty")
        String email,
        @NotBlank(message = "Password cannot be empty")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password) {
}
