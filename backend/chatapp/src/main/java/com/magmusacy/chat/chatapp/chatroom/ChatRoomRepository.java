package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findBySenderAndRecipient(User sender, User recipient);
}
