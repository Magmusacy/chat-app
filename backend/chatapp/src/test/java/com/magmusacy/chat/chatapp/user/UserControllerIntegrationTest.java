package com.magmusacy.chat.chatapp.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.magmusacy.chat.chatapp.AbstractIntegrationTest;
import com.magmusacy.chat.chatapp.blobs.BlobService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest extends AbstractIntegrationTest {

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

    private User testUser;

    @BeforeEach
    void setUp() {
        // Tworzenie testowego użytkownika
        testUser = new User();
        testUser.setName("Test User");
        testUser.setEmail("test@gmail.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "test@gmail.com")
    @DisplayName("Given authenticated user, when GET /user/me, then user info should be returned")
    void getUserInfo_WithAuthenticatedUser_ReturnsUserInfo() throws Exception {
        // When & Then
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@gmail.com"));
    }

    @Test
    @DisplayName("Given unauthenticated user, when GET /user/me, then unauthorized status should be returned")
    void getUserInfo_WithUnauthenticatedUser_ReturnsUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized());
    }
}
