package com.magmusacy.chat.chatapp.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.magmusacy.chat.chatapp.AbstractIntegrationTest;
import com.magmusacy.chat.chatapp.auth.dto.AuthenticationResponse;
import com.magmusacy.chat.chatapp.auth.dto.LoginRequest;
import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.blobs.BlobService;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BlobService blobService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Given valid registration request, when POST /auth/register, then JWT token should be returned")
    void register_WithValidRequest_ReturnsJwtToken() throws Exception {
        // Given
        RegisterRequest registerRequest = new RegisterRequest(
                "Test User",
                "test@gmail.com",
                "password123",
                "password123"
        );

        // When
        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

        // Then
        String responseContent = result.getResponse().getContentAsString();
        AuthenticationResponse response = objectMapper.readValue(responseContent, AuthenticationResponse.class);

        // Verify user was created in database
        User savedUser = userRepository.findByEmail("test@gmail.com").orElse(null);
        assertNotNull(savedUser);
        assertEquals("Test User", savedUser.getName());
        assertTrue(passwordEncoder.matches("password123", savedUser.getPassword()));

        // Verify tokens are valid
        String accessToken = response.accessToken();
        String refreshToken = response.refreshToken();
        assertNotNull(accessToken);
        assertNotNull(refreshToken);
        String username = jwtService.extractUsername(accessToken);
        assertEquals("test@gmail.com", username);
    }

    @Test
    @DisplayName("Given registration request with existing email, when POST /auth/register, then error should be returned")
    void register_WithExistingEmail_ReturnsError() throws Exception {
        // Given
        // Create a user first
        User existingUser = new User();
        existingUser.setName("Existing User");
        existingUser.setEmail("existing@gmail.com");
        existingUser.setPassword(passwordEncoder.encode("existingPass"));
        userRepository.save(existingUser);

        // Try to register with the same email
        RegisterRequest registerRequest = new RegisterRequest(
                "Another User",
                "existing@gmail.com",
                "password123",
                "password123"
        );

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Given valid login credentials, when POST /auth/login, then JWT token should be returned")
    void login_WithValidCredentials_ReturnsJwtToken() throws Exception {
        // Given
        // Create a user first
        User user = new User();
        user.setName("Login User");
        user.setEmail("login@gmail.com");
        user.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(user);

        // Login request
        LoginRequest loginRequest = new LoginRequest("login@gmail.com", "password123");

        // When
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

        // Then
        String responseContent = result.getResponse().getContentAsString();
        AuthenticationResponse response = objectMapper.readValue(responseContent, AuthenticationResponse.class);

        // Verify tokens are valid
        String accessToken = response.accessToken();
        String refreshToken = response.refreshToken();
        assertNotNull(accessToken);
        assertNotNull(refreshToken);
        String username = jwtService.extractUsername(accessToken);
        assertEquals("login@gmail.com", username);
    }

    @Test
    @DisplayName("Given incorrect login credentials, when POST /auth/login, then error should be returned")
    void login_WithInvalidCredentials_ReturnsError() throws Exception {
        // Given
        // Create a user first
        User user = new User();
        user.setName("Invalid Login User");
        user.setEmail("invalid@gmail.com");
        user.setPassword(passwordEncoder.encode("correctPassword"));
        userRepository.save(user);

        // Login with wrong password
        LoginRequest loginRequest = new LoginRequest("invalid@gmail.com", "wrongPassword");

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
