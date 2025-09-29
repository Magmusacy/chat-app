package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;

    public User createUser(RegisterRequest request, PasswordEncoder passwordEncoder) {
        if (!request.password().equals(request.passwordConfirmation())) {
            throw new PasswordMismatchException("Passwords do not match!");
        } else if (userRepository.existsByEmail(request.email())) {
            throw new UserAlreadyExistsException("This email is already in use");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        user.setPassword(passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }

    public void saveUser(User user) {
        user.setIsOnline(true);
        userRepository.save(user);
    }

    public UserDTO setUserOnline(int userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Wrong userId"));
        user.setIsOnline(true);
        user.setLastSeen(null);
        return new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen());
    }

    public void disconnectUser(User user) {
        Optional<User> connectedUser = userRepository.findById(user.getId());
        connectedUser.ifPresent(u -> {
            u.setIsOnline(false);
            u.setLastSeen(LocalDateTime.now());
            userRepository.save(u);
        });
    }

    public void connectUser(User user) {
        Optional<User> disconnectedUser = userRepository.findById(user.getId());
        disconnectedUser.ifPresent(u -> {
            u.setIsOnline(true);
            userRepository.save(u);
        });
    }

    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream().map(user -> new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen())).toList();
    }

    public void handleUserLogout(User user) {
        user.setIsOnline(false);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }

    public void handleUserLogin(User user) {
        user.setIsOnline(true);
        user.setLastSeen(null);
        userRepository.save(user);
    }

    public User findById(int id) {
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username).orElseThrow(
                () -> new UsernameNotFoundException("User not found")
        );
    }

    public UserMeDTO getUserInfo() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException(""));
        return new UserMeDTO(user.getId(), user.getName(), user.getEmail());
    }
}
