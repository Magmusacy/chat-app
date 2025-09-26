package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import com.magmusacy.chat.chatapp.chatroom.LatestMessageResponseDTO;
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

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;
    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;

    @MessageMapping("/chat.send-message")
    public void processMessage(
            @Payload ChatMessageDTO messageDTO,
            Principal principal
    ) {
        ChatMessage message = chatMessageService.save(messageDTO);
        User recipient = userService.findById(messageDTO.recipientId());
        ChatMessageResponseDTO responseDTO = new ChatMessageResponseDTO(
                message.getId(),
                messageDTO.content(),
                messageDTO.senderId(),
                messageDTO.recipientId(),
                messageDTO.chatRoomId(),
                message.getTimestamp()
        );

        // send the message
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                String.format("/queue/messages-from-%s", messageDTO.recipientId()),
                responseDTO
        );
        // send the latest message
        messagingTemplate.convertAndSendToUser(
                recipient.getEmail(),
                "/queue/chat.latest-message-updated",
                responseDTO
        );
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/chat.latest-message-updated",
                responseDTO
        );
    }

    @GetMapping("/messages/{recipientId}")
    public ResponseEntity<List<ChatMessageResponseDTO>> getMessages(
            @PathVariable int recipientId,
            Principal principal
    ) {
        User currentUser = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(chatMessageService.findChatMessages(currentUser.getId(), recipientId));
    }

    @GetMapping("/latest-messages")
    public ResponseEntity<List<LatestMessageResponseDTO>> getLatestMessages(
            Principal principal
    ) {
        User currentUser = userService.findByEmail(principal.getName());
        return ResponseEntity.ok(chatRoomService.getAllLatestMessages(currentUser));
    }
}
