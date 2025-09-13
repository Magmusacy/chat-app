package com.magmusacy.chat.chatapp.errorHandling;

public record ErrorResponse(
        int status,
        String error,
        String message,
        String path
) {
}
