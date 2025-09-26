package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.chat.ChatMessage;
import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String email;
    private String name;
    private String password;
    private Boolean isOnline = false;
    private LocalDateTime lastSeen;

    @Override
    public String getUsername() {
        return email;
    }

    @OneToMany(mappedBy = "sender", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<ChatMessage> sentMessages = new HashSet<>();

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<ChatMessage> receivedMessages = new HashSet<>();


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
