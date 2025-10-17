package com.magmusacy.chat.chatapp.chatroom;

public record SignalingMessage(
        String type,
        Object payload,
        String recipient,
        String sender
) {
}
