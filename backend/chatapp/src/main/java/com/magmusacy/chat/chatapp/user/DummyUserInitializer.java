package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.chat.ChatMessageDTO;
import com.magmusacy.chat.chatapp.chat.ChatMessageService;
import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@Profile("dev")
public class DummyUserInitializer {

    @Bean
    public CommandLineRunner initDummyUsers(UserService userService, ChatRoomService chatRoomService, ChatMessageService chatMessageService, PasswordEncoder passwordEncoder) {
        return args -> {
            User user1 = userService.createUser(
                    new RegisterRequest("Dummy One", "dummy1@example.com", "password", "password"),
                    passwordEncoder
            );
            User user2 = userService.createUser(
                    new RegisterRequest("Dummy Two", "dummy2@example.com", "password", "password"),
                    passwordEncoder
            );

            ChatRoom chatRoom = chatRoomService.getChatRoom(user1, user2, true).orElseThrow();
            ChatMessageDTO message1 = new ChatMessageDTO("First message", user1.getId(), user2.getId(), chatRoom.getId());
            ChatMessageDTO message2 = new ChatMessageDTO("Second message", user2.getId(), user1.getId(), chatRoom.getId());
            chatMessageService.save(message1);
            chatMessageService.save(message2);

            List<ChatMessageDTO> spammyMessage = List.of(new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()),
                    new ChatMessageDTO("SPAMMY message", user2.getId(), user1.getId(), chatRoom.getId()));
            for (var message : spammyMessage) {
                chatMessageService.save(message);
            }

        };
    }
}
