package com.magmusacy.chat.chatapp.blobs;

import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.dto.UserDTO;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/blobs")
@RequiredArgsConstructor
public class BlobController {
    private final BlobService blobService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadBlob(@RequestParam("file") MultipartFile file, Principal principal) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        } else if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body("File size cannot exceed 10MB");
        }

        try {
            User user = userService.findByEmail(principal.getName());
            UserDTO UpdatedUser = userService.handleUserProfilePictureUpload(user, file);
            List<UserDTO> users = userService.findAllUsers();
            messagingTemplate.convertAndSend("/topic/users", users);
            return ResponseEntity.ok(UpdatedUser);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
