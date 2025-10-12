package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.chat.ChatMessage;
import com.magmusacy.chat.chatapp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    @Query("SELECT c.latestMessage FROM ChatRoom c " +
            "WHERE c.latestMessage IS NOT NULL " +
            "AND (c.latestMessage.recipient = :currentUser OR c.latestMessage.sender = :currentUser)")
    List<ChatMessage> findAllLatestMessages(@Param("currentUser") User currentUser);

    @Query("SELECT DISTINCT c FROM ChatRoom c " +
            "JOIN c.chatMessages m WHERE m.sender = :user OR m.recipient = :user")
    List<ChatRoom> findChatRoomsByParticipatingUser(@Param("user") User user);
}
