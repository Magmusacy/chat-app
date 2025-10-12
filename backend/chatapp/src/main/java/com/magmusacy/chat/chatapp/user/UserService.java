package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.blobs.BlobService;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import com.magmusacy.chat.chatapp.user.dto.UpdateUserRequestDTO;
import com.magmusacy.chat.chatapp.user.dto.UserDTO;
import com.magmusacy.chat.chatapp.user.dto.UserMeDTO;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final BlobService blobService;
    private final ChatRoomService chatRoomService;

    @Transactional
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

//    public void saveUser(User user) {
//        user.setIsOnline(true);
//        userRepository.save(user);
//    }

    @Transactional
    public void saveUserProfilePictureUrl(User user, String url) {
        user.setProfilePictureUrl(url);
        userRepository.save(user);
    }

//    public UserDTO setUserOnline(int userId) {
//        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Wrong userId"));
//        user.setIsOnline(true);
//        user.setLastSeen(null);
//        return new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl());
//    }

    @Transactional
    public void disconnectUser(User user) {
        Optional<User> connectedUser = userRepository.findById(user.getId());
        connectedUser.ifPresent(u -> {
            u.setIsOnline(false);
            u.setLastSeen(LocalDateTime.now());
            userRepository.save(u);
        });
    }

    @Transactional
    public void connectUser(User user) {
        Optional<User> disconnectedUser = userRepository.findById(user.getId());
        disconnectedUser.ifPresent(u -> {
            u.setIsOnline(true);
            userRepository.save(u);
        });
    }

    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream().map(user -> new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl())).toList();
    }

    @Transactional
    public void handleUserLogout(User user) {
        user.setIsOnline(false);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
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
        return new UserMeDTO(user.getId(), user.getName(), user.getEmail(), user.getProfilePictureUrl());
    }

    @Transactional
    public UserDTO handleUserProfilePictureUpload(User user, MultipartFile file) throws IOException {
        String blobUrl = blobService.uploadBlob(user, file);
        saveUserProfilePictureUrl(user, blobUrl);
        return new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl());
    }

    @Transactional
    public void deleteUser(User user) {
        if (user.getProfilePictureUrl() != null) {
            blobService.deleteBlob(user.getProfilePictureUrl());
        }
        chatRoomService.deleteUserChatRooms(user);
        userRepository.delete(user);
    }

    @Transactional
    public UserMeDTO updateUser(User user, UpdateUserRequestDTO requestDTO, PasswordEncoder passwordEncoder) {
        if (!requestDTO.name().equals(user.getName())) {
            user.setName(requestDTO.name().trim());
        }

        if (requestDTO.password() != null && requestDTO.passwordConfirmation() != null) {
            if (!requestDTO.password().equals(requestDTO.passwordConfirmation())) {
                throw new IllegalArgumentException("Passwords don't match!");
            }

            if (requestDTO.password().length() < 8) {
                throw new IllegalArgumentException("Password must be at least 8 characters long");
            }

            user.setPassword(passwordEncoder.encode(requestDTO.password()));
        }

        User updatedUser = userRepository.save(user);
        return new UserMeDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getProfilePictureUrl()
        );
    }
}
