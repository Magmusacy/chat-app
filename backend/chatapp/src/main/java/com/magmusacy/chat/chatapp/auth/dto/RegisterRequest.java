package com.magmusacy.chat.chatapp.auth.dto;

public record RegisterRequest(String name, String email, String password, String passwordConfirmation) {
}
