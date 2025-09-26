package com.magmusacy.chat.chatapp.config;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserDTO;
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
        System.out.println(event);
        String email = event.getUser().getName();
        User user = userService.findByEmail(email);
        userService.handleUserLogin(user);
        List<UserDTO> users = userService.findAllUsers();
        messagingTemplate.convertAndSend("/topic/users", users);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        System.out.println(event);
        String email = event.getUser().getName();
        User user = userService.findByEmail(email);
        userService.handleUserLogout(user);
        List<UserDTO> users = userService.findAllUsers();
        messagingTemplate.convertAndSend("/topic/users", users);
    }

    // this will not be good for pagination
    @EventListener
    public void handleWebSocketSubscribeListener(SessionSubscribeEvent event) {
        String destination = (String) event.getMessage().getHeaders().get("simpDestination");
        if (destination != null && destination.startsWith("/user/queue/users")) {
            List<UserDTO> users = userService.findAllUsers();
            if (event.getUser() == null) return;
            messagingTemplate.convertAndSendToUser(event.getUser().getName(), "/queue/users", users);
        }
    }
}
