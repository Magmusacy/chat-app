package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.chat.ChatMessage;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
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

    @Email(message = "Please provide a valid email address")
    @NotBlank(message = "Email cannot be empty")
    @Column(unique = true, nullable = false)
    private String email;
    @Size(min = 4, max = 20, message = "Name must be between 4 and 20 characters")
    private String name;
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
    private Boolean isOnline = false;
    @Nullable
    private String profilePictureUrl = null;
    private LocalDateTime lastSeen;

    @Override
    public String getUsername() {
        return email;
    }

    @OneToMany(mappedBy = "sender")
    private Set<ChatMessage> sentMessages = new HashSet<>();

    @OneToMany(mappedBy = "recipient")
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
