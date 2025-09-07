package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;
    private String username;
    private String password;
    private Boolean isOnline;
    private LocalDateTime lastSeen;

    @Transient
    private List<ChatRoom> chatRooms;

}
