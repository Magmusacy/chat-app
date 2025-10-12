package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.chat.ChatMessage;
import com.magmusacy.chat.chatapp.user.User;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "chat_rooms")
public class ChatRoom {
    @Id
    private String id;

    @OneToMany(mappedBy = "chatRoom")
    private Set<ChatMessage> chatMessages = new HashSet<>();

    @OneToOne
    @JoinColumn(name = "latest_message_id")
    private ChatMessage latestMessage = null;

    private boolean readStatus = false;
}
