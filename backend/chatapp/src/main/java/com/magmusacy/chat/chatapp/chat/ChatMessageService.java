package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import jakarta.transaction.Transactional;
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

    @Transactional
    public ChatMessage save(ChatMessageDTO messageDTO) {
        User sender = userService.findById(messageDTO.senderId());
        User recipient = userService.findById(messageDTO.recipientId());

        ChatRoom chatRoom = chatRoomService.getChatRoom(
                sender,
                recipient,
                true
        ).orElseThrow();

        ChatMessage chatMessage = new ChatMessage(LocalDateTime.now(), messageDTO.content(), chatRoom, sender, recipient);
        ChatMessage latestMessage = chatMessageRepository.save(chatMessage);
        chatRoom.setLatestMessage(latestMessage);
        chatRoom.setReadStatus(false);
        chatRoomService.save(chatRoom);
        return latestMessage;
    }

    public List<ChatMessageResponseDTO> findChatMessages(int senderId, int recipientId) {
        User sender = userService.findById(senderId);
        User recipient = userService.findById(recipientId);
        return chatMessageRepository.findBySenderAndRecipient(sender, recipient).stream().map(m -> new ChatMessageResponseDTO(
                m.getId(),
                m.getContent(),
                m.getSender().getId(),
                m.getRecipient().getId(),
                m.getChatRoom().getId(),
                m.getTimestamp()
                )
        ).toList();
    }
}
