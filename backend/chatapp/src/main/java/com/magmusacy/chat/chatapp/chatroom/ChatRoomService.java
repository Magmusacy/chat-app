package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom save(ChatRoom chatRoom) {
        return chatRoomRepository.save(chatRoom);
    }

    public ChatRoom setReadLatestMessageStatus(ChatRoom chatRoom, boolean status) {
        chatRoom.setReadStatus(status);
        return chatRoomRepository.save(chatRoom);
    }

    public List<LatestMessageResponseDTO> getAllLatestMessages(User currentUser) {
        return chatRoomRepository.findAllLatestMessages(currentUser).stream().map(message -> new LatestMessageResponseDTO(
                message.getChatRoom().isReadStatus(),
                message.getSender().getId(),
                message.getRecipient().getId(),
                message.getContent(),
                message.getChatRoom().getId(),
                message.getTimestamp()
                )
        ).toList();
    }

    public Optional<ChatRoom> getChatRoom(
            User sender,
            User recipient,
            boolean createNewRoomIfNotExists
    ) {
        List<User> orderedUsers = getUsersInOrder(sender, recipient);
        User firstSender = orderedUsers.getFirst();
        User secondSender = orderedUsers.getLast();
        return chatRoomRepository.findById(generateChatRoomId(firstSender, secondSender))
        .or(() -> {
            if (createNewRoomIfNotExists) {
                return Optional.of(createChat(firstSender, secondSender));
            }
            return Optional.empty();
        });
    }

    private ChatRoom createChat(User firstSender, User secondSender) {
        String chatId = generateChatRoomId(firstSender, secondSender);

        ChatRoom room = ChatRoom.builder()
                .id(chatId)
                .build();

        chatRoomRepository.save(room);
        return room;
    }

    private String generateChatRoomId(User firstSender, User secondSender) {
        return String.format("%d_%d", firstSender.getId(), secondSender.getId());
    }

    private List<User> getUsersInOrder(User user1, User user2) {
        if (user1.getId().compareTo(user2.getId()) < 0) {
            return List.of(user1, user2);
        } else {
            return List.of(user2, user1);
        }
    }
}
