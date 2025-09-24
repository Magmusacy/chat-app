package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    @Query("SELECT m FROM ChatMessage m WHERE (m.sender = :sender AND m.recipient = :recipient) OR (m.sender = :recipient AND m.recipient = :sender) ORDER BY m.timestamp ASC")
    List<ChatMessage> findBySenderAndRecipient(User sender, User recipient);
}
