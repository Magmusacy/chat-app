package com.magmusacy.chat.chatapp.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.magmusacy.chat.chatapp.AbstractIntegrationTest;
import com.magmusacy.chat.chatapp.blobs.BlobService;
import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomRepository;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserRepository;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ChatControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BlobService blobService;

    @Autowired
    private ChatMessageService chatMessageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private User sender;
    private User recipient;
    private ChatRoom chatRoom;

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setName("Sender User");
        sender.setEmail("sender@example.com");
        sender.setPassword("password");
        sender = userRepository.save(sender);

        recipient = new User();
        recipient.setName("Recipient User");
        recipient.setEmail("recipient@example.com");
        recipient.setPassword("password");
        recipient = userRepository.save(recipient);

        chatRoom = new ChatRoom();
        chatRoom.setId(UUID.randomUUID().toString());
        chatRoom = chatRoomRepository.save(chatRoom);

        ChatMessage message1 = new ChatMessage(
                LocalDateTime.now().minusHours(1),
                "Hello",
                chatRoom,
                sender,
                recipient
        );
        ChatMessage message2 = new ChatMessage(
                LocalDateTime.now(),
                "Hi there",
                chatRoom,
                recipient,
                sender
        );
        chatMessageRepository.saveAll(List.of(message1, message2));
    }

    @AfterEach
    void tearDown() {
        chatMessageRepository.deleteAll();
        chatRoomRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "sender@example.com")
    @DisplayName("Given sender and recipient IDs, when GET /messages/{recipientId}, then chat messages should be returned")
    void findChatMessages_WithValidIds_ReturnsChatMessages() throws Exception {
        // Given
        int senderId = sender.getId();
        int recipientId = recipient.getId();

        // When & Then
        mockMvc.perform(get("/messages/{recipientId}", recipientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].content").value("Hello"))
                .andExpect(jsonPath("$[1].content").value("Hi there"));
    }

    @Test
    @DisplayName("Given unauthenticated user, when GET /messages/{senderId}/{recipientId}, then unauthorized status should be returned")
    void findChatMessages_WithUnauthenticatedUser_ReturnsUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/messages/{senderId}/{recipientId}", sender.getId(), recipient.getId()))
                .andExpect(status().isUnauthorized());
    }

//    TODO this test was problematic i have to redo it in the future
//    @Test
//    @WithMockUser(username = "sender@example.com")
//    @DisplayName("Given valid message DTO, when processing message, then message should be saved")
//    void processMessage_WithValidMessageDTO_SavesMessage() throws Exception {
//        // Given
//        ChatMessageDTO messageDTO = new ChatMessageDTO(
//                "New test message",
//                sender.getId(),
//                recipient.getId(),
//                chatRoom.getId()
//        );
//
//        // When & Then
//
//        long initialCount = chatMessageRepository.count();
//
//        chatMessageService.save(messageDTO);
//
//        long finalCount = chatMessageRepository.count();
//        assert finalCount == initialCount + 1;
//    }
}
