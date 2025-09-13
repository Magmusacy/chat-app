package com.magmusacy.chat.chatapp.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ServerProperties serverProperties;

    @MessageMapping("/user.addUser")
    @SendTo("/user/topic")
    public User addUser(@Payload User user) {
        userService.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/topic")
    public User disconnect(
            @Payload User user
    ) {
        userService.disconnectUser(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> findAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/user/me")
    public ResponseEntity<UserMeDTO> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo());
    }
}
