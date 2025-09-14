package com.magmusacy.chat.chatapp.auth;

import com.magmusacy.chat.chatapp.auth.dto.AuthenticationResponse;
import com.magmusacy.chat.chatapp.auth.dto.LoginRequest;
import com.magmusacy.chat.chatapp.auth.dto.RegisterRequest;
import com.magmusacy.chat.chatapp.user.PasswordMismatchException;
import com.magmusacy.chat.chatapp.user.User;
import com.magmusacy.chat.chatapp.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


//TODO: Should this be transactional, like the message should be sent if the transaction goes through
//TODO it might be better to just send the added user but whatever for now that works well
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final SimpMessagingTemplate messagingTemplate;

    public AuthenticationResponse register(RegisterRequest request) {
        User user = userService.createUser(request, passwordEncoder);
        String jwtToken = jwtService.generateToken(user);
        messagingTemplate.convertAndSend("/topic/users", userService.findAllUsers());
        return new AuthenticationResponse((jwtToken));
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userService.findByEmail(request.email());
        user.setIsOnline(true);
        String jwtToken = jwtService.generateToken(user);
        messagingTemplate.convertAndSend("/topic/users", userService.findAllUsers());
        return new AuthenticationResponse((jwtToken));
    }
}
