package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    public Optional<ChatRoom> getChatRoom(
            User sender,
            User recipient,
            boolean createNewRoomIfNotExists
    ) {
        return chatRoomRepository.findBySenderAndRecipient(sender, recipient)
        .or(() -> {
            if (createNewRoomIfNotExists) {
                return Optional.of(createChat(sender, recipient));
            }
            return Optional.empty();
        });
    }

    private ChatRoom createChat(User sender, User recipient) {
        User first_sender;
        User second_sender;
        if ((sender.getId().compareTo(recipient.getId())) < 0) {
            first_sender = sender;
            second_sender = recipient;
        } else {
            first_sender = recipient;
            second_sender = sender;
        }
        String chatId = String.format("%d_%d", first_sender.getId(), second_sender.getId());

        ChatRoom room = new ChatRoom(chatId, first_sender, second_sender);

        chatRoomRepository.save(room);
        return room;
    }
}
