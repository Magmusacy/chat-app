package com.magmusacy.chat.chatapp.user;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ServerProperties serverProperties;

    @GetMapping("/user/me")
    public ResponseEntity<UserMeDTO> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo());
    }
}
