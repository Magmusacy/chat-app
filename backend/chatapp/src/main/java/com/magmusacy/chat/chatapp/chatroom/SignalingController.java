package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class SignalingController {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @MessageMapping("/signal")
    public void handleSignalMessage(@Payload SignalingMessage message) {
        String sender = message.sender();
        int recipientId = Integer.parseInt(message.recipient());
        User recipient = userService.findById(recipientId);

        System.out.println(
                "Signal from " + sender + " to " + recipient + ": " +
                        "Type = " + message.type()  + " wiadomosc " + message.payload()
        );

        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/webrtc",
                message
        );
    }
}
