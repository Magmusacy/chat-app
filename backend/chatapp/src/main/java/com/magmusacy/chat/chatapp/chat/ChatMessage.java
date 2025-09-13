package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDateTime;

@Getter
@Setter
@RequiredArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NonNull
    private LocalDateTime timestamp;
    @NonNull
    private String content;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "chat_rooms_id")
    private ChatRoom chatRoom;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    @NonNull
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;
}
