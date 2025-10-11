package com.magmusacy.chat.chatapp.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Size(min = 4, max = 20, message = "Name must be between 4 and 10 characters")
        String name,
        @Email(message = "Please provide a valid email address")
        @NotBlank(message = "Email cannot be empty")
        String email,
        @NotBlank(message = "Password cannot be empty")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,
        @NotBlank(message = "Password cannot be empty")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String passwordConfirmation) {
}
