package com.magmusacy.chat.chatapp.chatroom;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatRoomController {
    private final UserService userService;
    private final ChatRoomService chatRoomService;

    @MessageMapping("/chat.read-latest-message")
    @SendToUser("/queue/chat.latest-message-updated")
    public LatestMessageResponseDTO readLatestMessage(@Payload ChatRoomEnterRequestDTO enterRequestDTO, Principal principal) {
        User firstChatUser = userService.findByEmail(principal.getName());
        User secondChatUser = userService.findById(enterRequestDTO.otherChatUser());

        ChatRoom chatRoom = chatRoomService.setReadLatestMessageStatus(
                chatRoomService.getChatRoom(firstChatUser, secondChatUser, false).
                orElseThrow(() -> new IllegalArgumentException("This chat room does not exist")), true);

        return new LatestMessageResponseDTO(chatRoom.isReadStatus(),
                chatRoom.getLatestMessage().getSender().getId(),
                chatRoom.getLatestMessage().getRecipient().getId(),
                chatRoom.getLatestMessage().getContent(),
                chatRoom.getId(),
                chatRoom.getLatestMessage().getTimestamp());
    }
}
