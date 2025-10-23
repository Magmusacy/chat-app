package com.magmusacy.chat.chatapp.chat;

import com.magmusacy.chat.chatapp.chatroom.ChatRoom;
import com.magmusacy.chat.chatapp.chatroom.ChatRoomService;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatRoomService chatRoomService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ChatMessageService chatMessageService;

    private User sender;
    private User recipient;
    private ChatRoom chatRoom;
    private ChatMessageDTO messageDTO;
    private ChatMessage savedMessage;
    private final String roomId = "room1";

    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(1);
        sender.setEmail("sender@gmail.com");
        sender.setName("Sender");

        recipient = new User();
        recipient.setId(2);
        recipient.setEmail("recipient@gmail.com");
        recipient.setName("Recipient");

        chatRoom = new ChatRoom();
        chatRoom.setId(roomId);

        messageDTO = new ChatMessageDTO("Hello, how are you?", 1, 2, roomId);

        savedMessage = new ChatMessage(
                LocalDateTime.now(),
                "Hello, how are you?",
                chatRoom,
                sender,
                recipient
        );
    }

    @Test
    @DisplayName("Given non-existing user ID, when save is called, then UsernameNotFoundException should be thrown")
    void save_WithNonExistingUser_ThrowsException() {
        // Given

        when(userService.findById(999)).thenThrow(new UsernameNotFoundException("User not found"));
        ChatMessageDTO invalidMessageDTO = new ChatMessageDTO("Test message", 999, 2, roomId);

        // When & Then
        assertThrows(UsernameNotFoundException.class, () ->
                chatMessageService.save(invalidMessageDTO)
        );
        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("Given non-existing chat room, when save is called, then NoSuchElementException should be thrown")
    void save_WithNonExistingChatRoom_ThrowsException() {
        // Given
        when(userService.findById(1)).thenReturn(sender);
        when(userService.findById(2)).thenReturn(recipient);
        when(chatRoomService.getChatRoom(sender, recipient, true)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () ->
                chatMessageService.save(messageDTO)
        );
        verify(chatMessageRepository, never()).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("Given sender and recipient IDs, when findChatMessages is called, then chat messages should be returned")
    void findChatMessages_WithValidIds_ReturnsChatMessages() {
        // Given
        List<ChatMessage> messages = Arrays.asList(
                new ChatMessage(LocalDateTime.now(), "Message 1", chatRoom, sender, recipient),
                new ChatMessage(LocalDateTime.now(), "Message 2", chatRoom, recipient, sender)
        );
        messages.get(0).setId(1);
        messages.get(1).setId(2);

        when(userService.findById(1)).thenReturn(sender);
        when(userService.findById(2)).thenReturn(recipient);
        when(chatMessageRepository.findBySenderAndRecipient(sender, recipient)).thenReturn(messages);

        // When
        List<ChatMessageResponseDTO> result = chatMessageService.findChatMessages(1, 2);

        // Then
        assertEquals(2, result.size());
        assertEquals("Message 1", result.get(0).content());
        assertEquals("Message 2", result.get(1).content());
        verify(chatMessageRepository).findBySenderAndRecipient(sender, recipient);
    }

    @Test
    @DisplayName("Given non-existing user ID, when findChatMessages is called, then UsernameNotFoundException should be thrown")
    void findChatMessages_WithNonExistingUser_ThrowsException() {
        // Given
        when(userService.findById(999)).thenThrow(new UsernameNotFoundException("User not found"));

        // When & Then
        assertThrows(UsernameNotFoundException.class, () ->
                chatMessageService.findChatMessages(999, 2)
        );
        verify(chatMessageRepository, never()).findBySenderAndRecipient(any(), any());
    }
}
