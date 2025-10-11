package com.magmusacy.chat.chatapp.user;

import com.magmusacy.chat.chatapp.user.dto.UpdateUserRequestDTO;
import com.magmusacy.chat.chatapp.user.dto.UserMeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserMeDTO> getUserInfo() {
        return ResponseEntity.ok(userService.getUserInfo());
    }

    @PostMapping("/update")
    public ResponseEntity<UserMeDTO> updateUser(@RequestBody UpdateUserRequestDTO requestDTO, Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);

        UserMeDTO updatedUser = userService.updateUser(user, requestDTO, passwordEncoder);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteUser(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        userService.deleteUser(user);

        return ResponseEntity.ok("User deleted successfully");
    }
}
