package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;
    private final UserService userService;

    public ChatMessage save(ChatMessageDTO messageDTO) {
        User sender = userService.findById(messageDTO.senderId()).orElseThrow();
        User recipient = userService.findById(messageDTO.recipientId()).orElseThrow();

        ChatRoom chatRoom = chatRoomService.getChatRoom(
                sender,
                recipient,
                true
        ).orElseThrow();

        ChatMessage chatMessage = new ChatMessage(LocalDateTime.now(), messageDTO.content(), chatRoom, sender, recipient);
        return chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(int senderId, int recipientId) {
        User sender = userService.findById(senderId).orElseThrow();
        User recipient = userService.findById(recipientId).orElseThrow();
        return chatMessageRepository.findBySenderAndRecipient(sender, recipient);
    }
}
