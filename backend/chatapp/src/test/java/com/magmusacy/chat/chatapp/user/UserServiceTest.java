package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@gmail.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");

        registerRequest = new RegisterRequest("Test User", "test@gmail.com", "password", "password");
    }

    @Test
    @DisplayName("Given valid registration request, when createUser is called, then user should be created")
    void createUser_WithValidRequest_CreatesUser() {
        // Given
        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User createdUser = userService.createUser(registerRequest, passwordEncoder);

        // Then
        assertNotNull(createdUser);
        assertEquals("test@gmail.com", createdUser.getEmail());
        assertEquals("Test User", createdUser.getName());
        assertEquals("encodedPassword", createdUser.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Given registration request with mismatched passwords, when createUser is called, then PasswordMismatchException should be thrown")
    void createUser_WithMismatchedPasswords_ThrowsPasswordMismatchException() {
        // Given
        RegisterRequest requestWithMismatchedPasswords = new RegisterRequest(
                "Test User", "test@gmail.com", "password", "differentPassword");

        // When & Then
        assertThrows(PasswordMismatchException.class, () ->
            userService.createUser(requestWithMismatchedPasswords, passwordEncoder)
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Given registration request with existing email, when createUser is called, then UserAlreadyExistsException should be thrown")
    void createUser_WithExistingEmail_ThrowsUserAlreadyExistsException() {
        // Given
        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(true);

        // When & Then
        assertThrows(UserAlreadyExistsException.class, () ->
            userService.createUser(registerRequest, passwordEncoder)
        );
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Given user ID, when findById is called, then user should be returned")
    void findById_WithExistingUserId_ReturnsUser() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // When
        Optional<User> foundUser = userService.findById(1);

        // Then
        assertTrue(foundUser.isPresent());
        assertEquals(testUser, foundUser.get());
    }

    @Test
    @DisplayName("Given user email, when findByEmail is called, then user should be returned")
    void findByEmail_WithExistingEmail_ReturnsUser() {
        // Given
        when(userRepository.findByEmail("test@gmail.com")).thenReturn(Optional.of(testUser));

        // When
        User foundUser = userService.findByEmail("test@gmail.com");

        // Then
        assertNotNull(foundUser);
        assertEquals(testUser, foundUser);
    }

    @Test
    @DisplayName("Given non-existing email, when findByEmail is called, then UsernameNotFoundException should be thrown")
    void findByEmail_WithNonExistingEmail_ThrowsUsernameNotFoundException() {
        // Given
        when(userRepository.findByEmail("nonexistent@gmail.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UsernameNotFoundException.class, () ->
            userService.findByEmail("nonexistent@gmail.com")
        );
    }

    @Test
    @DisplayName("Given a user, when disconnectUser is called, then user status should be updated")
    void disconnectUser_ShouldUpdateUserStatus() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // When
        userService.disconnectUser(testUser);

        // Then
        verify(userRepository).findById(1);
        verify(userRepository).save(any(User.class));
        // Would verify the user object had its isOnline set to false and lastSeen updated
    }

    @Test
    @DisplayName("Given a user, when connectUser is called, then user status should be updated")
    void connectUser_ShouldUpdateUserStatus() {
        // Given
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

        // When
        userService.connectUser(testUser);

        // Then
        verify(userRepository).findById(1);
        verify(userRepository).save(any(User.class));
        // Would verify the user object had its isOnline set to true
    }
}
