package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Integer> {
    List<ChatMessage> findBySenderAndRecipient(User sender, User recipient);
}
