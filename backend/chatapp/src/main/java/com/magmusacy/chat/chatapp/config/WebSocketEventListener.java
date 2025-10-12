package com.magmusacy.chat.chatapp.config;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.dto.UserDTO;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        String email = event.getUser().getName();
        User user = userService.findByEmail(email);
        userService.handleUserLogin(user);
        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl());
        messagingTemplate.convertAndSend("/topic/users", userDTO);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String email = event.getUser().getName();
        User user = userService.findByEmail(email);
        userService.handleUserLogout(user);
        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl());
        messagingTemplate.convertAndSend("/topic/users", userDTO);
    }
}
