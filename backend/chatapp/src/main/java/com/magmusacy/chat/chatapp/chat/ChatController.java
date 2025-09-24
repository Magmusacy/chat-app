package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat")
    public void processMessage(
            @Payload ChatMessageDTO messageDTO
    ) {
        ChatMessage message = chatMessageService.save(messageDTO);
        User recipient = userService.findById(messageDTO.recipientId()).orElseThrow(() -> new IllegalArgumentException("Wrong recipient ID"));
        ChatMessageResponseDTO responseDTO = new ChatMessageResponseDTO(
                message.getId(),
                messageDTO.content(),
                messageDTO.senderId(),
                messageDTO.recipientId(),
                messageDTO.chatRoomId(),
                message.getTimestamp()
        );

        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                String.format("/chat/%s", messageDTO.recipientId()),
                responseDTO
        );
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessageResponseDTO>> findChatMessages(
            @PathVariable("senderId") int senderId,
            @PathVariable("recipientId") int recipientId
    ) {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId, recipientId));
    }
}
