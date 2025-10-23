package com.magmusacy.chat.chatapp.auth;

import com.magmusacy.chat.chatapp.auth.dto.AuthenticationResponse;
import com.magmusacy.chat.chatapp.auth.dto.LoginRequest;
import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.user.PasswordMismatchException;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserAlreadyExistsException;
import com.magmusacy.chat.chatapp.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@gmail.com");
        testUser.setName("Test User");
        testUser.setPassword("encodedPassword");

        registerRequest = new RegisterRequest("Test User", "test@gmail.com", "password", "password");
        loginRequest = new LoginRequest("test@gmail.com", "password");
    }

    @Test
    @DisplayName("Given valid registration request, when register is called, then JWT token should be returned")
    void register_WithValidRequest_ReturnsJwtToken() {
        // Given
        when(userService.createUser(any(RegisterRequest.class), any(PasswordEncoder.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");

        // When
        AuthenticationResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.accessToken());
        assertEquals("refreshToken", response.refreshToken());
        verify(userService).createUser(registerRequest, passwordEncoder);
        verify(jwtService).generateAccessToken(testUser);
        verify(jwtService).generateRefreshToken(testUser);
    }

    @Test
    @DisplayName("Given valid login credentials, when login is called, then JWT token should be returned")
    void login_WithValidCredentials_ReturnsJwtToken() {
        // Given
        when(userService.findByEmail("test@gmail.com")).thenReturn(testUser);
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");

        // When
        AuthenticationResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.accessToken());
        assertEquals("refreshToken", response.refreshToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userService).findByEmail("test@gmail.com");
        verify(jwtService).generateAccessToken(testUser);
        verify(jwtService).generateRefreshToken(testUser);
    }

    @Test
    @DisplayName("Given existing email, when register is called, then UserAlreadyExistsException should be thrown")
    void register_WithExistingEmail_ThrowsException() {
        // Given
        when(userService.createUser(any(RegisterRequest.class), any(PasswordEncoder.class)))
            .thenThrow(new UserAlreadyExistsException("This email is already in use"));

        // When & Then
        assertThrows(UserAlreadyExistsException.class, () ->
            authService.register(registerRequest)
        );
    }

    @Test
    @DisplayName("Given mismatched passwords, when register is called, then PasswordMismatchException should be thrown")
    void register_WithMismatchedPasswords_ThrowsException() {
        // Given
        RegisterRequest badRequest = new RegisterRequest("Test User", "test@gmail.com", "pass1", "pass2");
        when(userService.createUser(any(RegisterRequest.class), any(PasswordEncoder.class)))
            .thenThrow(new PasswordMismatchException("Passwords do not match!"));

        // When & Then
        assertThrows(PasswordMismatchException.class, () ->
            authService.register(badRequest)
        );
    }

    @Test
    @DisplayName("Given non-existing user, when login is called, then UsernameNotFoundException should be thrown")
    void login_WithNonExistingUser_ThrowsException() {
        // Given
        when(userService.findByEmail("notfound@gmail.com"))
            .thenThrow(new UsernameNotFoundException("User not found"));
        LoginRequest badLogin = new LoginRequest("notfound@gmail.com", "password");

        // When & Then
        assertThrows(UsernameNotFoundException.class, () ->
            authService.login(badLogin)
        );
    }

    @Test
    @DisplayName("Given wrong password, when login is called, then AuthenticationException should be thrown")
    void login_WithWrongPassword_ThrowsException() {
        // Given
        doThrow(new AuthenticationException("Bad credentials") {})
            .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        LoginRequest badLogin = new LoginRequest("test@gmail.com", "wrongpassword");

        // When & Then
        assertThrows(AuthenticationException.class, () ->
            authService.login(badLogin)
        );
    }

    @Test
    @DisplayName("Given empty email, when login is called, then UsernameNotFoundException should be thrown")
    void login_WithEmptyEmail_ThrowsException() {
        // Given
        when(userService.findByEmail("")).thenThrow(new UsernameNotFoundException("User not found"));
        LoginRequest badLogin = new LoginRequest("", "password");

        // When & Then
        assertThrows(UsernameNotFoundException.class, () ->
            authService.login(badLogin)
        );
    }
}
