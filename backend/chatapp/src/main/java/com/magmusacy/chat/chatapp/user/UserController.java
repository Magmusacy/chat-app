package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.user.dto.UpdateUserRequestDTO;
import com.magmusacy.chat.chatapp.user.dto.UserDTO;
import com.magmusacy.chat.chatapp.user.dto.UserMeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/me")
    public ResponseEntity<UserMeDTO> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo());
    }

    @GetMapping()
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @PostMapping("/update")
    public ResponseEntity<UserMeDTO> updateUser(@RequestBody UpdateUserRequestDTO requestDTO, Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);

        UserMeDTO myUpdatedInformation = userService.updateUser(user, requestDTO, passwordEncoder);
        UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getIsOnline(), user.getLastSeen(), user.getProfilePictureUrl());
        messagingTemplate.convertAndSend("/topic/users", userDTO);
        return ResponseEntity.ok(myUpdatedInformation);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteUser(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        int userId = user.getId();
        userService.deleteUser(user);
        messagingTemplate.convertAndSend("/topic/deleted.user", userId);
        return ResponseEntity.ok("User deleted successfully");
    }
}
